let jobs=[];
let statusFilter='active';
let quickView='all';
const saved=JSON.parse(localStorage.getItem('enStatuses')||'{}');
const facetKeys=['area','location','employment_group','chance_group','theatre_group','type'];

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const perthToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Perth',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const statusOf=j=>saved[j.id]??j.status??'APPLY';
const isApplied=s=>String(s).includes('Applied');
const isDisregarded=s=>String(s).includes('Disregarded');
const isClosed=s=>String(s).includes('Closed');
const isConsidering=s=>String(s).includes('Considering');
const isNew=j=>j.new_date===perthToday();
const stars=s=>(String(s).match(/⭐/g)||[]).length;

function chanceValue(s){
  s=String(s||'');
  if(s.includes('Very good')) return 4;
  if(s.includes('Good')) return 3.2;
  if(s.includes('🟢/🟡')) return 2.6;
  if(s.includes('Stretch')||s.includes('🟡')) return 2;
  if(s.includes('🔴')||s.includes('Low')) return 1;
  return 2.2;
}
function chanceGroup(s){const v=chanceValue(s);return v>=3.7?'Very good':v>=3?'Good':v>=1.8?'Stretch / Moderate':'Low currently'}
function theatreGroup(j){const n=stars(j.theatre);return n>=5?'5★':n===4?'4★':n===3?'3★':n===2?'2★':'1★'}
function employmentGroup(s){
  s=String(s||'').toLowerCase();
  if(s.includes('graduate')) return 'Graduate';
  if(s.includes('permanent')&&s.includes('part')) return 'Permanent part-time';
  if(s.includes('permanent')&&s.includes('full')) return 'Permanent full-time';
  if(s.includes('casual')) return 'Casual / mixed';
  if(s.includes('part-time')||s.includes('part time')) return 'Part-time';
  if(s.includes('full-time')||s.includes('full time')) return 'Full-time';
  if(s.includes('fixed')) return 'Fixed-term';
  return 'Other';
}
function incomeValue(p){
  p=String(p||''); if(!p||p==='Not stated') return 0;
  const hSegment=p.split('/hr')[0], hs=hSegment.match(/\$[\d,.]+/g);
  if(p.includes('/hr')&&hs) return Math.max(...hs.map(x=>Number(x.replace(/[$,]/g,''))));
  const aSegment=p.split('/yr')[0], as=aSegment.match(/\$[\d,.]+/g);
  if(p.includes('/yr')&&as) return Math.max(...as.map(x=>Number(x.replace(/[$,]/g,''))))/1976;
  const wk=p.split('/week')[0], ws=wk.match(/\$[\d,.]+/g);
  if(p.includes('/week')&&ws) return Math.max(...ws.map(x=>Number(x.replace(/[$,]/g,''))))/38;
  return 0;
}
function locationScore(loc){
  const s=String(loc||'').toLowerCase();
  if(s.includes('midland')) return 100;
  if(s.includes('ellenbrook')) return 95;
  if(/guildford|bassendean|bayswater|belmont|ascot|forrestfield|morley|mundaring/.test(s)) return 85;
  if(s.includes('maddington')) return 72;
  if(s.includes('perth hospitals')||s==='perth'||s.includes('perth private')) return 60;
  if(/nedlands|subiaco|wembley|south perth|stirling|murdoch/.test(s)) return 55;
  if(/joondalup|duncraig/.test(s)) return 35;
  return 50;
}
function payScore(pay){const h=incomeValue(pay);if(h>=50)return 100;if(h>=45)return 95;if(h>=40)return 88;if(h>=35)return 75;if(h>0)return 60;return 50}
function fitScore(j){
  const chance=(chanceValue(j.chance)/4)*100;
  const theatre=(stars(j.theatre)/5)*100;
  return Math.round(chance*.45 + theatre*.30 + locationScore(j.location)*.15 + payScore(j.pay)*.10);
}
function parseDateOnly(s){const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?Date.UTC(+m[1],+m[2]-1,+m[3]):null}
function daysUntilClose(j){const t=parseDateOnly(j.closing_date), now=parseDateOnly(perthToday());return t===null||now===null?null:Math.floor((t-now)/86400000)}
function closingInfo(j){
  const d=daysUntilClose(j), raw=j.closing_date||'Not stated';
  if(d===null) return {label:'Not stated',sub:'no closing date shown',cls:''};
  if(d<0) return {label:'Expired',sub:raw,cls:'bad'};
  if(d===0) return {label:'Closes today',sub:raw,cls:'bad'};
  if(d<=3) return {label:`${d} day${d===1?'':'s'} left`,sub:raw,cls:'bad'};
  if(d<=7) return {label:`${d} days left`,sub:raw,cls:'warn'};
  return {label:raw.split(' ')[0],sub:`${d} days left`,cls:'good'};
}
function requirementBadges(j){
  const s=(j.role+' '+j.chance+' '+j.area).toLowerCase(), out=[];
  if(/iv[- ]qualified|iv qualification|iv-qualified/.test(s)) out.push(['IV required','bad']);
  if(/1–2 years|1-2 years|12 months|2 years|1 year clinical|post-graduate|experience required|required.*experience/.test(s)) out.push(['Experience required','bad']);
  if(/scrub|scout|anaesthetic|pacu|perioperative/.test(s)&&/required|low currently/.test(s)) out.push(['Specialist theatre experience','bad']);
  if(/no minimum.*experience|no minimum en experience/.test(s)) out.push(['No minimum EN experience stated','good']);
  if(/graduate|transition/.test(s)) out.push(['Graduate pathway','good']);
  if(/ahpra/.test(s)) out.push(['AHPRA','good']);
  if(!out.length && chanceValue(j.chance)>=3) out.push(['First-EN friendly','good']);
  return out.slice(0,4);
}
function isHospital(j){const s=(j.role+' '+j.source+' '+j.area).toLowerCase();return /hospital|health campus|sjog|ramsay|wa health|scgh|osborne|medical ward|acute|surgical/.test(s)}
function isGraduate(j){return /graduate|transition/.test((j.role+' '+j.area+' '+j.employment).toLowerCase())}
function isTheatre(j){return /theatre|periop|scrub|scout|anaesthetic|pacu|surgical|day surgery|procedural/.test((j.role+' '+j.area).toLowerCase())}
function isEast(j){return locationScore(j.location)>=70}
function isStretch(j){return chanceValue(j.chance)<=2.1}
function enrich(j){return {...j, employment_group:employmentGroup(j.employment), chance_group:chanceGroup(j.chance), theatre_group:theatreGroup(j), fit:fitScore(j)}}

function setStatus(id,s){saved[id]=s;localStorage.setItem('enStatuses',JSON.stringify(saved));render()}
function statusVisible(j){const s=statusOf(j);if(statusFilter==='all')return true;if(statusFilter==='active')return !isApplied(s)&&!isDisregarded(s)&&!isClosed(s);if(statusFilter==='applied')return isApplied(s);if(statusFilter==='disregarded')return isDisregarded(s);if(statusFilter==='closed')return isClosed(s);return true}
function quickVisible(j){if(quickView==='all')return true;if(quickView==='active')return statusVisible(j);if(quickView==='applied')return isApplied(statusOf(j));if(quickView==='new')return isNew(j);if(quickView==='best')return j.fit>=75&&!isStretch(j);if(quickView==='closing'){const d=daysUntilClose(j);return d!==null&&d>=0&&d<=7;}if(quickView==='hospital')return isHospital(j);if(quickView==='graduate')return isGraduate(j);if(quickView==='theatre')return isTheatre(j);if(quickView==='east')return isEast(j);if(quickView==='stretch')return isStretch(j);return true}
function textVisible(j){const q=$('search').value.trim().toLowerCase();if(!q)return true;return Object.values(j).some(v=>String(v??'').toLowerCase().includes(q))}
function facetVisible(j){for(const key of facetKeys){const sel=$(key+'Filter'); if(sel&&sel.value&&String(j[key])!==sel.value) return false;} const income=$('incomeFilter').value; if(income==='stated'&&incomeValue(j.pay)===0)return false; if(income==='not'&&incomeValue(j.pay)>0)return false; return true}
function compare(a,b,key){if(key==='fit')return a.fit-b.fit;if(key==='rank')return a.rank-b.rank;if(key==='chance')return chanceValue(a.chance)-chanceValue(b.chance);if(key==='theatre')return stars(a.theatre)-stars(b.theatre);if(key==='pay')return incomeValue(a.pay)-incomeValue(b.pay);if(key==='closing'){const aa=daysUntilClose(a),bb=daysUntilClose(b);return (aa===null?99999:aa)-(bb===null?99999:bb)}return String(a[key]||'').localeCompare(String(b[key]||''),undefined,{numeric:true,sensitivity:'base'})}
function currentRows(){const key=$('sortKey').value, dir=$('sortDir').value==='asc'?1:-1;return jobs.filter(statusVisible).filter(quickVisible).filter(textVisible).filter(facetVisible).slice().sort((a,b)=>compare(a,b,key)*dir)}

function statusChip(s){let cls=''; if(isApplied(s))cls='applied'; else if(isDisregarded(s))cls='disregarded'; else if(isClosed(s))cls='closed'; else if(isConsidering(s))cls='considering'; return `<span class="status-chip ${cls}">${esc(s)}</span>`}
function summaryStats(){
  const active=jobs.filter(j=>!isApplied(statusOf(j))&&!isDisregarded(statusOf(j))&&!isClosed(statusOf(j)));
  return {
    new:jobs.filter(isNew).length,
    best:active.filter(j=>j.fit>=75&&!isStretch(j)).length,
    closing:active.filter(j=>{const d=daysUntilClose(j); return d!==null&&d>=0&&d<=7;}).length,
    applied:jobs.filter(j=>isApplied(statusOf(j))).length,
    active:active.length
  };
}
function renderSummary(){
  const stats=summaryStats();
  Object.entries(stats).forEach(([k,v])=>{const el=$('sum-'+k); if(el){const val=el.querySelector('.summary-value'); if(val) val.textContent=v;}});
  document.querySelectorAll('.summary-card').forEach(x=>x.classList.toggle('active',x.dataset.view===quickView));
}
function renderPills(){
  document.querySelectorAll('[data-status]').forEach(x=>x.classList.toggle('on',x.dataset.status===statusFilter));
  document.querySelectorAll('[data-quick]').forEach(x=>x.classList.toggle('on',x.dataset.quick===quickView));
}
function visibleChanceShort(s){
  s=String(s||'');
  if(s.includes('Very good')) return '🟢🟢 Very good';
  if(s.includes('Good')) return '🟢 Good';
  if(s.includes('🟢/🟡')) return '🟢/🟡 Moderate';
  if(s.includes('Stretch')||s.includes('🟡')) return '🟡 Stretch';
  if(s.includes('🔴')||s.includes('Low')) return '🔴 Low currently';
  return s || 'Not stated';
}

function render(){
  renderSummary();
  renderPills();
  const rows=currentRows();
  $('resultCount').textContent=`${rows.length} role${rows.length===1?'':'s'} shown`;
  const grid=$('jobGrid');
  if(!rows.length){grid.innerHTML='<article class="empty-card">No roles match these filters.</article>';return;}
  grid.innerHTML=rows.map(j=>{
    const s=statusOf(j), close=closingInfo(j), reqs=requirementBadges(j);
    const reqHTML=reqs.map(([t,c])=>`<span class="chip ${c}">${esc(t)}</span>`).join('');
    const newChip=isNew(j)?'<span class="chip new">🆕 NEW</span>':'';
    const link=j.url?`<a class="link-btn" href="${esc(j.url)}" target="_blank" rel="noopener">Open listing ↗</a>`:`<span class="link-btn muted">No direct link</span>`;
    return `
      <article class="job-card">
        <div class="card-top">
          <div>
            <h3 class="role-title">${esc(j.role)}</h3>
            <p class="org-line">${esc(j.source||'Source not stated')}</p>
          </div>
          <div class="fit-badge"><span class="num">${j.fit}</span><span class="lbl">fit</span></div>
        </div>

        <div class="chips">
          ${newChip}
          <span class="chip">${esc(j.area)}</span>
          <span class="chip purple">${esc(j.type)}</span>
          ${reqHTML}
        </div>

        <div class="mini-grid">
          <div class="mini-block"><span class="mini-label">Location</span><span class="mini-value">${esc(j.location)}</span></div>
          <div class="mini-block"><span class="mini-label">Employment</span><span class="mini-value">${esc(j.employment_group||j.employment)}</span></div>
          <div class="mini-block"><span class="mini-label">Chance</span><span class="mini-value">${esc(visibleChanceShort(j.chance))}</span></div>
          <div class="mini-block"><span class="mini-label">Theatre relevance</span><span class="mini-value">${esc(j.theatre)}</span></div>
        </div>

        <div class="pay-strip">
          <div>
            <span class="mini-label">Pay</span>
            <div class="text">${esc(j.pay||'Not stated')}</div>
          </div>
        </div>

        <div class="close-strip">
          <div>
            <span class="mini-label">Closing</span>
            <div class="text ${close.cls}">${esc(close.label)}<small>${esc(close.sub)}</small></div>
          </div>
        </div>

        <div class="status-row">
          ${statusChip(s)}
          ${link}
        </div>

        <details class="card-details">
          <summary>More details + status ▾</summary>
          <div class="detail-wrap">
            <div class="detail-grid">
              <div><b>Full employment</b>${esc(j.employment||'Not stated')}</div>
              <div><b>Listed date</b>${esc(j.listed_date||'Not stated')}</div>
              <div><b>Date added</b>${esc(j.date_added||'Not stated')}</div>
              <div><b>Closing date</b>${esc(j.closing_date||'Not stated')}</div>
              <div><b>Source</b>${esc(j.source||'Not stated')}</div>
              <div><b>Type</b>${esc(j.type||'Not stated')}</div>
              <div><b>Published rank</b>#${esc(j.rank)}</div>
              <div><b>Last verified</b>${esc(j.last_verified||'Not stated')}</div>
              <div style="grid-column:1/-1"><b>Chance notes</b>${esc(j.chance||'Not stated')}</div>
            </div>
            <div class="requirements">${reqHTML || '<span class="chip">No special requirement tag</span>'}</div>
            <div class="status-actions" data-id="${esc(j.id)}"></div>
          </div>
        </details>
      </article>`;
  }).join('');

  grid.querySelectorAll('.status-actions').forEach(box=>{
    const job=rows.find(r=>r.id===box.dataset.id);
    if(!job) return;
    [['✅ Applied','Applied'],['🚫 Disregarded','Disregarded'],['🟡 Considering','Considering'],['❌ Closed','Closed'],[job.status||'APPLY','Restore']].forEach(([value,label])=>{
      const b=document.createElement('button');
      b.textContent=label;
      b.onclick=()=>setStatus(job.id,value);
      box.appendChild(b);
    });
  });
}

function populateFilters(){
  facetKeys.forEach(key=>{
    const sel=$(key+'Filter'); if(!sel) return;
    const vals=[...new Set(jobs.map(j=>j[key]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)));
    vals.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;sel.appendChild(o);});
  });
}
function clearFilters(){
  facetKeys.forEach(k=>{const e=$(k+'Filter'); if(e) e.value='';});
  $('incomeFilter').value='';
  $('search').value='';
  $('sortKey').value='fit';
  $('sortDir').value='desc';
  quickView='all';
  statusFilter='active';
  render();
}
function exportRows(rows,xlsx){
  const mapped=rows.map(j=>({Rank:j.rank,'Fit score':j.fit,'New?':isNew(j)?'🆕 NEW':'—',Area:j.area,Role:j.role,Location:j.location,Employment:j.employment,Chance:j.chance,'Theatre relevance':j.theatre,'Status / Apply?':statusOf(j),'Listed date':j.listed_date||'Not stated','Date added':j.date_added||'Not stated','Closing date':j.closing_date||'Not stated','Pay (hourly / annual)':j.pay||'Not stated',Type:j.type,Source:j.source||'Not stated',Link:j.url||'Not stated','Last verified':j.last_verified||'Not stated'}));
  if(xlsx){
    const ws=XLSX.utils.json_to_sheet(mapped), wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Master Tracker');
    XLSX.writeFile(wb,'EN_Nursing_Master_Tracker.xlsx');
  } else {
    const ws=XLSX.utils.json_to_sheet(mapped), csv=XLSX.utils.sheet_to_csv(ws), a=document.createElement('a');
    a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download='EN_Nursing_Visible_Rows.csv';
    a.click();
  }
}

document.addEventListener('click',e=>{
  const statusBtn=e.target.closest('[data-status]');
  if(statusBtn){statusFilter=statusBtn.dataset.status; render(); return;}
  const quickBtn=e.target.closest('[data-quick]');
  if(quickBtn){quickView=quickBtn.dataset.quick; render(); return;}
  const summaryBtn=e.target.closest('.summary-card[data-view]');
  if(summaryBtn){quickView=summaryBtn.dataset.view; if(quickView==='active') quickView='all'; if(quickView==='applied') statusFilter='applied'; else if(quickView==='all') statusFilter='active'; render(); return;}
});

['search','incomeFilter','sortKey','sortDir',...facetKeys.map(k=>k+'Filter')].forEach(id=>{
  const el=$(id); if(el) el.addEventListener(id==='search'?'input':'change',render);
});
$('clearFilters').addEventListener('click',clearFilters);
$('xlsx').addEventListener('click',()=>exportRows(currentRows(),true));
$('csv').addEventListener('click',()=>exportRows(currentRows(),false));

fetch('./jobs.json?ts='+Date.now())
  .then(r=>r.json())
  .then(data=>{
    jobs=(data||[]).map(enrich);
    populateFilters();
    $('sortKey').value='fit';
    $('sortDir').value='desc';
    render();
  })
  .catch(()=>{
    $('jobGrid').innerHTML='<article class="empty-card">Could not load jobs.json.</article>';
    $('resultCount').textContent='Unable to load roles';
  });
