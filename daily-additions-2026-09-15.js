(()=>{
  const additions=[
    {
      id:'sjog-midland-medical-jr18794',rank:1,area:'Acute Medical',
      role:'SJOG Midland Public – Enrolled & Registered Nurses - Medical (Ward 3A)',location:'Midland',
      employment:'Permanent part-time',
      chance:'🟢🟢 Very good first-EN target – current AHPRA EN/RN registration required; direct employer ad does not state a minimum post-registration EN experience requirement',
      theatre:'⭐⭐⭐',status:'APPLY',listed_date:'2026-09-09',date_added:'2026-09-15',new_date:'2026-09-15',
      closing_date:'2026-09-23',pay:'$75,179–$106,629/yr pro rata + 12% super',type:'Vacancy',
      source:'St John of God Health Care',url:'https://sjog.wd105.myworkdayjobs.com/en-US/SJGHC_External_Career_Site/job/Midland-Western-Australia/Enrolled-and-Registered-Nurses---Medical_JR-18794',last_verified:'2026-09-15'
    },
    {
      id:'sjog-midland-transit-lounge-2026',rank:2,area:'Acute / Discharge / Rehabilitation',
      role:'SJOG Midland Public – Enrolled & Registered Nurse - Level 3 Transit Lounge',location:'Midland',
      employment:'Fixed-term part-time; hours negotiable; shifts across Mon–Sun',
      chance:'🟢 Good first-EN target – current AHPRA EN/RN registration required; strong clinical skills relevant to rehabilitation requested; no fixed minimum post-registration EN years stated',
      theatre:'⭐⭐⭐',status:'APPLY',listed_date:'2026-09',date_added:'2026-09-15',new_date:'2026-09-15',
      closing_date:'Not stated',pay:'$75,179–$106,629/yr pro rata + 12% super',type:'Vacancy',
      source:'St John of God Health Care / LinkedIn',url:'https://au.linkedin.com/jobs/view/enrolled-registered-nurse-level-3-transit-lounge-midland-public-at-st-john-of-god-health-care-4461534886',last_verified:'2026-09-15'
    },
    {
      id:'pch-en-emergency-741738',rank:3,area:'Emergency / Acute Paediatrics',
      role:'Perth Children’s Hospital – Enrolled Nurse, Emergency Department',location:'Nedlands',
      employment:'Permanent FT/PT or fixed-term FT/PT; part-time may be offered at 0.84 FTE+',
      chance:'🟢 Good – strong acute development opportunity; AHPRA EN required; public ad does not state a fixed minimum post-registration EN experience requirement',
      theatre:'⭐⭐⭐⭐',status:'APPLY',listed_date:'2026-09-01',date_added:'2026-09-15',new_date:'2026-09-15',
      closing_date:'2026-09-15 4:00 PM AWST',pay:'$1,461.76–$1,541.11/week pro rata • ~$38.47–$40.56/hr (38h) • ~$76,012–$80,138/yr',type:'Vacancy',
      source:'WA Health / Jobs WA',url:'https://search.jobs.wa.gov.au/jobs/enrolled-nurse-emergency-department-perth-metropolitan-western-australia-australia',last_verified:'2026-09-15'
    }
  ];
  let tries=0;
  const merge=()=>{
    if(typeof jobs==='undefined'||!Array.isArray(jobs)||!jobs.length){if(tries++<100)setTimeout(merge,100);return;}
    const ids=new Set(jobs.map(j=>j.id));
    let changed=false;
    additions.forEach(a=>{if(!ids.has(a.id)){jobs.push(typeof enrich==='function'?enrich(a):a);changed=true;}});
    if(changed&&typeof render==='function')render();
  };
  merge();
})();