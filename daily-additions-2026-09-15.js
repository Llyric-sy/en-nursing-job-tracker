(()=>{
  const today='2026-09-19';
  const additions=[
    {
      id:'allergy-first-karrinyup-en-2026',rank:76,area:'Procedural / Allergy Clinic',
      role:'Allergy First – Enrolled Nurse, Allergy Clinic',location:'Karrinyup',employment:'Casual',
      chance:'🟢 Good first-EN option – EN-specific allergy-clinic role focused on patient interaction; no mandatory post-registration EN years or separate IV qualification stated in current public evidence',
      theatre:'⭐⭐⭐',status:'APPLY',listed_date:'2026-09-17',date_added:'2026-09-17',new_date:'2026-09-17',closing_date:'Not stated',pay:'Not stated',type:'Vacancy',
      source:'Allergy First / SEEK',url:'https://au.seek.com/enrolled-nurses-jobs/in-All-Perth-WA',last_verified:today
    },
    {
      id:'my-flex-health-clinical-client-care-en-2026',rank:77,area:'Clinical Support / Administration / Community',
      role:'My Flex Health – Enrolled Nurse, Clinical / Client Care Support',location:'Perth',employment:'Full-time',
      chance:'🟢/🟡 Good first-EN / non-bedside development option – EN-specific clinical care, scheduling and administration role; no fixed minimum post-registration EN years stated in current public evidence',
      theatre:'⭐',status:'APPLY',listed_date:'2026-09-18',date_added:today,new_date:today,closing_date:'Not stated',pay:'$73,000–$75,000/yr • approx. $36.94–$37.96/hr FTE equivalent',type:'Vacancy',
      source:'My Flex Health / SEEK',url:'https://au.seek.com/enrolled-nurses-jobs/in-All-Perth-WA',last_verified:today
    }
  ];
  let tries=0;
  const merge=()=>{
    if(typeof jobs==='undefined'||!Array.isArray(jobs)||!jobs.length){if(tries++<100)setTimeout(merge,100);return;}
    let changed=false;
    const find=pred=>jobs.find(pred);
    const patch=(job,updates)=>{if(!job)return;const published=String(job.status||'');const keepApplied=published.includes('Applied');Object.entries(updates).forEach(([k,v])=>{if(k==='status'&&keepApplied)return;if(job[k]!==v){job[k]=v;changed=true;}});};
    const close=(job,date,reason)=>patch(job,{status:'❌ Closed',closing_date:date,last_verified:today,closure_reason:reason});

    close(find(j=>j.id==='pch-en-emergency-department-741738'),'2026-09-15 4:00 PM AWST','Authoritative WA Health deadline was 15 September 2026 at 4:00 PM AWST and has passed.');
    close(find(j=>j.id==='hollywood-surgical-en-jr115564'),'2026-09-18','Published application deadline was 18 September 2026 and has passed.');
    close(find(j=>j.id==='sjog-midland-private-surgical-rn-en-jr18129'),'2026-09-18','St John of God application period has ended; the authoritative Workday end date was 18 September 2026.');
    close(find(j=>j.id==='sjog-subiaco-eye-scrub-scout-en-rn-4458715722'),'2026-09-15','Published application deadline was 15 September 2026 and has passed.');

    patch(find(j=>j.id==='sjog-murdoch-periop-scrub-scout-pool-jr5662'),{
      status:'APPLY',closing_date:'Open pool – applications considered as positions become available over the next six months',last_verified:today,
      closure_reason:'',url:'https://sjog.wd105.myworkdayjobs.com/en-US/SJGHC_External_Career_Site/job/Enrolled-and-Registered-Nurse---Perioperative-Theatre-Scrub-Scout_JR-5662-1'
    });
    patch(find(j=>j.id==='scgoph-all-specialties-pool-2026'),{closing_date:'2026-12-18 4:00 PM AWST',last_verified:today});
    patch(find(j=>j.id==='st-andrews-rn-en'),{last_verified:today});
    patch(find(j=>j.id==='lifeblood-midland-en-rn-mobile-pop-up-2026'),{last_verified:today});
    patch(find(j=>j.id==='joondalup-vascular-access-en-jr115396'),{closing_date:'2026-09-25',last_verified:today});
    patch(find(j=>j.id==='hca-rn-en-acute'),{last_verified:today});
    patch(find(j=>j.id==='sustainhealth-rn-en'),{pay:'$45–$87/hr + super • ~$88,920–$171,912/yr FTE equivalent',last_verified:today});
    patch(find(j=>j.id==='alpha-nursing-perth-metro-en-rn-2026'),{closing_date:'2026-10-30',last_verified:today});
    patch(find(j=>j.id==='talent-quarter-perth-public-hospital-en-2026'),{
      pay:'$48–$67/hr • ~$94,848–$132,392/yr FTE equivalent',
      chance:'🔴 Low currently – current agency listing seeks experienced RN/EN applicants for Perth Metro hospital shifts; exact minimum years are not stated in current public evidence',last_verified:today
    });
    patch(find(j=>j.id==='perth-clinic-mental-health-grad-en-2027'),{closing_date:'2026-09-30',last_verified:today});

    additions.forEach(a=>{
      const existing=jobs.find(j=>j.id===a.id);
      if(existing){patch(existing,{...a,status:existing.status});return;}
      jobs.push(typeof enrich==='function'?enrich(a):a);changed=true;
    });
    if(changed&&typeof render==='function')render();
  };
  merge();
})();