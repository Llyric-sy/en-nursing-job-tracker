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
  if(s.includes('Very good'))return 4;
  if(s.includes('Good'))return 3.2;
  if(s.includes('🟢/🟡'))return 2.6;
  if(s.includes('Stretch')||s.includes('🟡'))return 2;
  if(s.includes('🔴')||s.includes('Low'))return 1;
  return 2.2;
}
function chanceGroup(s){const v=chanceValue(s);return v>=3.7?'Very good':v>=3?'Good':v>=1.8?'Stretch / Moderate':'Low currently'}
function theatreGroup(j){const n=stars(j.theatre);return n>=5?'5★':n===4?'4★':n===3?'3★':n===2?'2★':'1★'}
function employmentGroup(s){s=String(s||'').toLowerCase();if(s.includes('graduate'))return 'Graduate';if(s.includes('permanent')&&s.includes('part'))return 'Permanent part-time';if(s.includes('permanent')&&s.includes('full'))return 'Permanent full-time';if(s.includes('casual'))return 'Casual / mixed';if(s.includes('part-time')||s.includes('part time'))return 'Part-time';if(s.includes('full-time')||s.includes('full time'))return 'Full-time';if(s.includes('fixed'))return 'Fixed-term';return 'Other'}
function incomeValue(p){
  p=String(p||'');if(!p||p==='Not stated')return 0;
  const hSegment=p.split('/hr')[0], hs=hSegment.match(/\$[\d,.]+/g);
  if(p.includes('/hr')&&hs)return Math.max(...hs.map(x=>Number(x.replace(/[$,]/g,''))));
  const aSegment=p.split('/yr')[0], as=aSegment.match(/\$[\d,.]+/g);
  if(p.includes('/yr')&&as)return Math.max(...as.map(x=>Number(x.replace(/[$,]/g,''))))/1976;
  const wk=p.split('/week')[0], ws=wk.match(/\$[\d,.]+/g);
  if(p.includes('/week')&&ws)return Math.max(...ws.map(x=>Number(x.replace(/[$,]/g,''))))/38;
  return 0;
}
function locationScore(loc){
  const s=String(loc||'').toLowerCase();
  if(s.includes('midland'))return 100;
  if(s.includes('ellenbrook'))return 95;
  if(/guildford|bassendean|bayswater|maylands|belmont|ascot|forrestfield|morley/.test(s))return 85;
  if(s.includes('maddington'))return 70;
  if(s.includes('perth hospitals')||s==='perth'||s.includes('perth private'))return 60;
  if(/nedlands|subiaco|wembley|south perth|stirling/.test(s))return 55;
  if(/joondalup|duncraig/.test(s))return 35;
  return 50;
}
function payScore(pay){const h=incomeValue(pay);if(h>=50)return 100;if(h>=45)return 95;if(h>=40)return 88;if(h>=35)return 75;if(h>0)return 60;return 50}
function fitScore(j){
  const chance=(chanceValue(j.chance)/4)*100;
  const theatre=(stars(j.theatre)/5)*100;
  return Math.round(chance*.45+theatre*.30+locationScore(j.location)*.15+payScore(j.pay)*.10);
}
function fitClass(score){return score>=78?'good':score>=60?'warn':'bad'}
function parseDateOnly(s){const m=String(s||'').match(/^(\d{4})-(\d{2})-(\d{2})/);return m?Date.UTC(+m[1],+m[2]-1,+m[3]):null}
function daysUntilClose(j){const t=parseDateOnly(j.closing_date);if(t===null)return null;const now=parseDateOnly(perthToday());return Math.floor((t-now)/86400000)}
function closingInfo(j){
  const d=daysUntilClose(j), raw=j.closing_date||'Not stated';
  if(d===null)return {label:'Not stated',sub:'',cls:''};
  if(d<0)return {label:'Expired',sub:raw,cls:'bad'};
  if(d===0)return {label:'Closes today',sub:raw,cls:'bad'};
  if(d<=3)return {label:`${d} day${d===1?'':'s'} left`,sub:raw,cls:'bad'};
  if(d<=7)return {label:`${d} days left`,sub:raw,cls:'warn'};
  return {label:raw.split(' ')[0],sub:d+' days',cls:''};
}
function requirementBadges(j){
  const s=(j.role+' '+j.chance+' '+j.area).toLowerCase(), out=[];
  if(/iv[- ]qualified|iv qualification|iv-qualified/.test(s))out.push(['IV required','bad']);
  if(/1–2 years|1-2 years|12 months|2 years|1 year clinical|experience required|required.*experience/.test(s))out.push(['Experience required','bad']);
  if(/scrub|scout|anaesthetic|pacu|perioperative/.test(s)&&/required|low currently/.test(s))out.push(['Specialist theatre experience','bad']);
  if(/no minimum.*experience|no minimum en experience/.test(s))out.push(['No minimum EN experience stated','good']);
  if(/graduate/.test(s))out.push(['Graduate pathway','good']);
  if(/ahpra/.test(s))out.push(['AHPRA','good']);
  if(!out.length&&chanceValue(j.chance)>=3)out.push(['First-EN friendly','good']);
  return out.slice(0,4);
}
function isHospital(j){const s=(j.role+' '+j.source+' '+j.area).toLowerCase();return /hospital|health campus|sjog|ramsay|wa health|scgh|osborne|medical ward|acute|surgical/.test(s)}
function isGraduate(j){return /graduate|transition/.test((j.role+' '+j.area+' '+j.employment).toLowerCase())}
function isTheatre(j){return /theatre|periop|scrub|scout|anaesthetic|pacu|surgical|day surgery|procedural/.test((j.role+' '+j.area).toLowerCase())}
function isEast(j){return locationScore(j.location)>=70}
function isStretch(j){return chanceValue(j.chance)<=2.1}

function enrich(j){return {...j,employment_group:employmentGroup(j.employment),chance_group:chanceGroup(j.chance),theatre_group:theatreGroup(j),fit:fitScore(j)}}
function setStatus(id,s){saved[id]=s;localStorage.setItem('enStatuses',JSON.stringify(saved));render()}

function statusVisible(j){const s=statusOf(j);if(statusFilter==='all')return true;if(statusFilter==='active')return !isApplied(s)&&!isDisregarded(s)&&!isClosed(s);if(statusFilter==='applied')return isApplied(s);if(statusFilter==='disregarded')return isDisregarded(s);if(statusFilter==='closed')return isClosed(s);return true}
function quickVisible(j){if(quickView==='all')return true;if(quickView==='new')return isNew(j);if(quickView==='best')return j.fit>=75&&!isStretch(j);if(quickView==='closing')return daysUntilClose(j)!==null&&daysUntilClose(j)>=0&&daysUntilClose(j)<=7;if(quickView==='hospital')return isHospital(j);if(quickView==='graduate')return isGraduate(j);if(quickView==='theatre')return isTheatre(j);if(quickView==='east')return isEast(j);if(quickView==='stretch')return isStretch(j);return true}
function textVisible(j){const q=$('search').value.trim().toLowerCase();if(!q)return true;return Object.values(j).some(v=>String(v??'').toLowerCase().includes(q))}
function facetVisible(j){for(const key of facetKeys){const sel=$(key+'Filter');if(sel&&sel.value&&String(j[key])!==sel.value)return false}const income=$('incomeFilter').value;if(income==='stated'&&incomeValue(j.pay)===0)return false;if(income==='not'&&incomeValue(j.pay)>0)return false;return true}
function compare(a,b,key){if(key==='fit')return a.fit-b.fit;if(key==='rank')return a.rank-b.rank;if(key==='chance')return chanceValue(a.chance)-chanceValue(b.chance);if(key==='theatre')return stars(a.theatre)-stars(b.theatre);if(key==='pay')return incomeValue(a.pay)-incomeValue(b.pay);if(key==='closing'){const aa=daysUntilClose(a),bb=daysUntilClose(b);return (aa===null?99999:aa)-(bb===null?99999:bb)}return String(a[key]||'').localeCompare(String(b[key]||''),undefined,{numeric:true,sensitivity:'base'})}
function currentRows(){const key=$('sortKey').value,dir=$('sortDir').value==='asc'?1:-1;return jobs.filter(statusVisible).filter(quickVisible).filter(textVisible).filter(facetVisible).slice().sort((a,b)=>compare(a,b,key)*dir)}

function renderSummary(){
  const active=jobs.filter(j=>!isApplied(statusOf(j))&&!isDisregarded(statusOf(j))&&!isClosed(statusOf(j)));
  const stats={new:jobs.filter(isNew).length,best:active.filter(j=>j.fit>=75&&!isStretch(j)).length,closing:active.filter(j=>{const d=daysUntilClose(j);return d!==null&&d>=0&&d<=7}).length,applied:jobs.filter(j=>isApplied(statusOf(j))).length,active:active.length};
  Object.entries(stats).forEach(([k,v])=>{const el=$('sum-'+k);if(el)el.querySelector('.value').textContent=v});
  document.querySelectorAll('.summary-card').forEach(x=>x.classList.toggle('active',x.dataset.view===quickView||(x.dataset.view==='all'&&quickView==='all')));
}
function renderQuickPills(){document.querySelectorAll('[data-quick]').forEach(x=>x.classList.toggle('on',x.dataset.quick===quickView))}
function statusChip(s){let cls='';if(isApplied(s))cls='applied';else if(isDisregarded(s))cls='disregarded';else if(isClosed(s))cls='closed';else if(isConsidering(s))cls='considering';return `<span class="status-chip ${cls}">${esc(s)}</span>`}
function render(){
  renderSummary();renderQuickPills();
  const rows=currentRows(), body=$('body');body.innerHTML='';
  $('resultCount').textContent=`${rows.length} role${rows.length===1?'':'s'} shown`;
  if(!rows.length){body.innerHTML='<tr><td class="empty" colspan="9">No roles match these filters.</td></tr>';return}
  rows.forEach(j=>{
    const close=closingInfo(j), reqs=requirementBadges(j), s=statusOf(j), tr=document.createElement('tr');
    const link=j.url?`<a class="link" href="${esc(j.url)}" target="_blank" rel="noopener">Open ↗</a>`:'<span class="nolink">No direct link</span>';
    const reqHTML=reqs.map(([t,c])=>`<span class="chip ${c}">${esc(t)}</span>`).join('');
    tr.innerHTML=`
      <td class="fit" data-label="Fit"><div class="fit-score">${j.fit}</div><div class="fit-rank">#${j.rank} rank</div></td>
      <td class="role" data-label="Role"><div class="role-title">${esc(j.role)}</div><div class="chips">${isNew(j)?'<span class="chip new">🆕 NEW</span>':''}<span class="chip">${esc(j.area)}</span><span class="chip purple">${esc(j.type)}</span></div>
        <details class="details"><summary>More details + status ▾</summary><div class="detail-box"><div class="detail-grid"><div><b>Source:</b> ${esc(j.source||'Not stated')}</div><div><b>Listed:</b> ${esc(j.listed_date||'Not stated')}</div><div><b>Date added:</b> ${esc(j.date_added||'Not stated')}</div><div><b>Closing:</b> ${esc(j.closing_date||'Not stated')}</div></div><div class="reqs">${reqHTML}</div><div class="status-actions" data-id="${esc(j.id)}"></div></div></details>
      </td>
      <td data-label="Location">${esc(j.location)}</td>
      <td data-label="Employment">${esc(j.employment)}</td>
      <td class="chance" data-label="Chance">${esc(j.chance)}</td>
      <td class="stars" data-label="Theatre">${esc(j.theatre)}</td>
      <td class="pay" data-label="Pay">${esc(j.pay||'Not stated')}</td>
      <td class="closing" data-label="Closing"><strong class="${close.cls}">${esc(close.label)}</strong><small>${esc(close.sub)}</small></td>
      <td data-label="Status"><div class="row-actions">${statusChip(s)} ${link}</div></td>`;
    const actionBox=tr.querySelector('.status-actions');
    [['✅ Applied','Applied'],['🚫 Disregarded','Disregarded'],['🟡 Considering','Considering'],['❌ Closed','Closed'],[j.status||'APPLY','Restore']].forEach(([value,label])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>setStatus(j.id,value);actionBox.appendChild(b)});
    body.appendChild(tr);
  })
}
function populateFilters(){
  facetKeys.forEach(key=>{const sel=$(key+'Filter');if(!sel)return;const vals=[...new Set(jobs.map(j=>j[key]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b)));vals.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;sel.appendChild(o)})})
}
function clearFilters(){facetKeys.forEach(k=>{const e=$(k+'Filter');if(e)e.value=''});$('incomeFilter').value='';$('search').value='';$('sortKey').value='fit';$('sortDir').value='desc';quickView='all';render()}
function exportRows(rows,xlsx){
  const mapped=rows.map(j=>({Rank:j.rank,'Fit score':j.fit,'New?':isNew(j)?'🆕 NEW':'—',Area:j.area,Role:j.role,Location:j.location,Employment:j.employment,Chance:j.chance,'Theatre relevance':j.theatre,'Status / Apply?':statusOf(j),'Listed date':j.listed_date||'Not stated','Date added':j.date_added||'Not stated','Closing date':j.closing_date||'Not stated','Pay (hourly / annual)':j.pay||'Not stated',Type:j.type,Source:j.source||'Not stated',Link:j.url||'Not stated'}));
  if(xlsx){const ws=XLSX.utils.json_to_sheet(mapped),wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'Master Tracker');XLSX.writeFile(wb,'EN_Nursing_Master_Tracker.xlsx')}else{const ws=XLSX.utils.json_to_sheet(mapped),csv=XLSX.utils.sheet_to_csv(ws),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='EN_Nursing_Visible_Rows.csv';a.click()}
}

document.querySelectorAll('[data-status]').forEach(btn=>btn.onclick=()=>{statusFilter=btn.dataset.status;document.querySelectorAll('[data-status]').forEach(x=>x.classList.toggle('on',x===btn));render()});
document.querySelectorAll('[data-quick]').forEach(btn=>btn.onclick=()=>{quickView=btn.dataset.quick;render()});
document.querySelectorAll('.summary-card').forEach(card=>card.onclick=()=>{quickView=card.dataset.view;if(quickView==='applied'){statusFilter='applied';quickView='all';document.querySelectorAll('[data-status]').forEach(x=>x.classList.toggle('on',x.dataset.status==='applied'))}else if(card.dataset.view==='active'){statusFilter='active';quickView='all';document.querySelectorAll('[data-status]').forEach(x=>x.classList.toggle('on',x.dataset.status==='active'))}render()});
$('search').oninput=render;
[...facetKeys.map(k=>k+'Filter'),'incomeFilter','sortKey','sortDir'].forEach(id=>{$(id).onchange=render});
$('clearFilters').onclick=clearFilters;
$('xlsx').onclick=()=>exportRows(jobs,true);
$('csv').onclick=()=>exportRows(currentRows(),false);

fetch('./jobs.json?ts='+Date.now()).then(r=>{if(!r.ok)throw new Error('jobs.json');return r.json()}).then(data=>{jobs=data.map(enrich);populateFilters();render()}).catch(()=>{$('body').innerHTML='<tr><td class="empty" colspan="9">Could not load jobs.json.</td></tr>'});
