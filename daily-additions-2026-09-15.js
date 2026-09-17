(()=>{
  const today='2026-09-17';
  const additions=[
    {
      id:'sjog-midland-transit-lounge-2026',rank:2,area:'Acute / Discharge / Rehabilitation',
      role:'SJOG Midland Public – Enrolled & Registered Nurse - Level 3 Transit Lounge',location:'Midland',
      employment:'Fixed-term part-time; hours negotiable; shifts across Mon–Sun',
      chance:'🟢 Good first-EN target – current AHPRA EN/RN registration required; strong clinical skills relevant to a rehabilitation environment requested; no fixed minimum post-registration EN years stated',
      theatre:'⭐⭐⭐',status:'APPLY',listed_date:'2026-09',date_added:'2026-09-15',new_date:'2026-09-15',
      closing_date:'Not stated / may close early',pay:'$75,179–$106,629/yr pro rata + 12% super',type:'Vacancy',
      source:'St John of God Health Care / LinkedIn',url:'https://au.linkedin.com/jobs/view/enrolled-registered-nurse-level-3-transit-lounge-midland-public-at-st-john-of-god-health-care-4461534886',last_verified:today
    },
    {
      id:'allergy-first-karrinyup-en-2026',rank:76,area:'Procedural / Allergy Clinic',
      role:'Allergy First – Enrolled Nurse, Allergy Clinic',location:'Karrinyup',
      employment:'Casual',
      chance:'🟢 Good first-EN option – current listing is EN-specific and focuses on patient interaction in a supportive allergy-clinic setting; no mandatory post-registration EN years or separate IV qualification stated in current public evidence',
      theatre:'⭐⭐⭐',status:'APPLY',listed_date:'2026-09-15',date_added:today,new_date:today,
      closing_date:'Not stated',pay:'Not stated',type:'Vacancy',source:'Allergy First / SEEK',
      url:'https://au.seek.com/enrolled-nurses-jobs/in-All-Perth-WA',last_verified:today
    },
    {
      id:'sjog-midland-private-surgical-jr18129',rank:77,area:'Acute Surgical / Pre & Post-operative',
      role:'SJOG Midland Private – Registered & Enrolled Nurses, Surgical Ward',location:'Midland',
      employment:'Full-time',
      chance:'🟡 Stretch but unusually strong local theatre pathway – AHPRA EN/RN required; recent surgical-ward experience including pre/post-operative care is required/expected',
      theatre:'⭐⭐⭐⭐⭐',status:'Backup',listed_date:'2026-08-28',date_added:today,new_date:today,
      closing_date:'2026-09-18',pay:'$75,179–$106,629/yr + 12% super',type:'Vacancy',source:'St John of God Health Care',
      url:'https://sjog.wd105.myworkdayjobs.com/en-US/SJGHC_External_Career_Site/job/Registered-Nurses---Surgical--Midland-Private-_JR-18129-1',last_verified:today
    }
  ];
  let tries=0;
  const merge=()=>{
    if(typeof jobs==='undefined'||!Array.isArray(jobs)||!jobs.length){if(tries++<100)setTimeout(merge,100);return;}
    let changed=false;
    const find=(pred)=>jobs.find(pred);
    const patch=(job,updates)=>{if(!job)return;const published=String(job.status||'');const keepApplied=published.includes('Applied');Object.entries(updates).forEach(([k,v])=>{if(k==='status'&&keepApplied)return;if(job[k]!==v){job[k]=v;changed=true;}});};

    patch(find(j=>/Perth Children.?s Hospital/.test(j.role||'')&&/Emergency Department/.test(j.role||'')),{
      status:'❌ Closed',closing_date:'2026-09-15 4:00 PM AWST',last_verified:today,
      closure_reason:'Authoritative WA Health deadline was 15 September 2026 at 4:00 PM AWST and has passed.'
    });
    patch(find(j=>/SCGH.*Osborne Park/.test(j.role||'')&&/All Specialties Pool/.test(j.role||'')),{
      closing_date:'2026-12-18 4:00 PM AWST',last_verified:today
    });
    patch(find(j=>/SJOG Midland Public/.test(j.role||'')&&/Medical/.test(j.role||'')),{
      closing_date:'2026-09-23',last_verified:today,
      url:'https://sjog.wd105.myworkdayjobs.com/en-US/SJGHC_External_Career_Site/job/Midland-Western-Australia/Enrolled-and-Registered-Nurses---Medical_JR-18794'
    });
    patch(find(j=>/Lifeblood/.test(j.role||'')&&/Mobile/.test(j.role||'')),{last_verified:today});

    additions.forEach(a=>{
      let existing=jobs.find(j=>j.id===a.id);
      if(!existing&&/Transit Lounge/.test(a.role))existing=find(j=>/Transit Lounge/.test(j.role||'')&&/Midland/.test(j.role||''));
      if(existing){patch(existing,{...a,status:existing.status,last_verified:today});return;}
      jobs.push(typeof enrich==='function'?enrich(a):a);changed=true;
    });
    if(changed&&typeof render==='function')render();
  };
  merge();
})();