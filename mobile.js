(()=>{
  const shortChance=s=>{
    s=String(s||'').trim();
    const cut=s.split(/\s+[–—-]\s+/)[0];
    return cut.length>18?cut.slice(0,17)+'…':cut;
  };
  const compactEmployment=s=>{
    s=String(s||'').toLowerCase();
    if(s.includes('graduate'))return 'Graduate';
    if(s.includes('permanent')&&s.includes('part'))return 'Permanent PT';
    if(s.includes('permanent')&&s.includes('full'))return 'Permanent FT';
    if(s.includes('part-time')||s.includes('part time'))return 'Part-time';
    if(s.includes('full-time')||s.includes('full time'))return 'Full-time';
    if(s.includes('casual'))return 'Casual / mixed';
    if(s.includes('fixed'))return 'Fixed-term';
    return 'See details';
  };
  const compactPay=s=>{
    s=String(s||'').trim();
    if(!s||s==='Not stated')return 'Not stated';
    const hourly=s.match(/\$[\d,.]+(?:\s*[–-]\s*\$?[\d,.]+)?\/hr/);
    if(hourly)return hourly[0].replace(/\s+/g,'');
    const annual=s.match(/\$[\d,.]+(?:\s*[–-]\s*\$?[\d,.]+)?\/yr/);
    if(annual)return annual[0].replace(/\s+/g,'');
    const weekly=s.match(/\$[\d,.]+(?:\s*[–-]\s*\$?[\d,.]+)?\/week/);
    if(weekly)return weekly[0].replace(/\s+/g,'');
    return 'See details';
  };
  const text=(row,label)=>row.querySelector(`td[data-label="${label}"]`)?.textContent.trim()||'Not stated';

  function enhance(row){
    if(row.querySelector('.mobile-glance')||row.querySelector('.empty'))return;
    const role=row.querySelector('.role');
    if(!role)return;

    const location=text(row,'Location');
    const employment=text(row,'Employment');
    const chance=text(row,'Chance');
    const theatre=text(row,'Theatre');
    const pay=text(row,'Pay');
    const closingCell=row.querySelector('td[data-label="Closing"]');
    const closingLabel=closingCell?.querySelector('strong')?.textContent.trim()||'Not stated';
    const status=text(row,'Status').replace(/Open\s*↗/g,'').trim();

    const glance=document.createElement('div');
    glance.className='mobile-glance';
    glance.innerHTML=`
      <div class="mobile-location">📍 ${escapeHTML(location)} · ${escapeHTML(compactEmployment(employment))}</div>
      <div class="mobile-metrics">
        <div class="mobile-metric"><span>Chance</span><strong>${escapeHTML(shortChance(chance))}</strong></div>
        <div class="mobile-metric"><span>Theatre</span><strong>${escapeHTML(theatre)}</strong></div>
        <div class="mobile-metric"><span>Pay</span><strong>${escapeHTML(compactPay(pay))}</strong></div>
      </div>
      ${closingLabel!=='Not stated'?`<div class="mobile-closing">⏰ <strong>${escapeHTML(closingLabel)}</strong></div>`:''}`;

    const details=role.querySelector('.details');
    role.insertBefore(glance,details||null);

    const box=details?.querySelector('.detail-box');
    const grid=details?.querySelector('.detail-grid');
    if(grid&&!grid.dataset.mobileExtended){
      grid.dataset.mobileExtended='true';
      [
        ['Location',location],['Employment',employment],['Chance',chance],['Theatre relevance',theatre],['Pay',pay],['Current status',status]
      ].forEach(([label,value])=>{
        const d=document.createElement('div');
        d.className='mobile-extra-detail';
        d.innerHTML=`<b>${escapeHTML(label)}:</b> ${escapeHTML(value)}`;
        grid.appendChild(d);
      });
    }
    if(box&&!box.querySelector('.mobile-detail-link')){
      const sourceLink=row.querySelector('td[data-label="Status"] .link');
      if(sourceLink){
        const a=document.createElement('a');
        a.className='mobile-detail-link';
        a.href=sourceLink.href;a.target='_blank';a.rel='noopener';a.textContent='Open listing ↗';
        box.appendChild(a);
      }else{
        const span=document.createElement('span');
        span.className='mobile-detail-link nolink';span.textContent='No direct listing link';box.appendChild(span);
      }
    }
  }
  function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function scan(){document.querySelectorAll('#body tr').forEach(enhance)}
  const body=document.getElementById('body');
  if(body){new MutationObserver(scan).observe(body,{childList:true,subtree:true});scan()}
})();
