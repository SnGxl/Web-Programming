(function(){
  // أدوات عامة
  const el = (id)=>document.getElementById(id);
  const els = {
    weight: el('weight'), height: el('height'), age: el('age'), sex: el('sex'),
    goal: el('goal'), focusArea: el('focusArea'), activity: el('activity'), environment: el('environment'),
    wake: el('wake'), sleep: el('sleep'), workoutTime: el('workoutTime'), workoutMinutes: el('workoutMinutes'),
    daysPerWeek: el('daysPerWeek'), fatLossStyle: el('fatLossStyle'),
    updateBtn: el('updateBtn'), printBtn: el('printBtn'), resetBtn: el('resetBtn'),
    waterLiters: el('waterLiters'), waterDetail: el('waterDetail'),
    stepsTarget: el('stepsTarget'), stepsHint: el('stepsHint'),
    caloriesTarget: el('caloriesTarget'), proteinChip: el('proteinChip'), fatChip: el('fatChip'), carbChip: el('carbChip'),
    weeklyPlan: el('weeklyPlan'), splitChips: el('splitChips'),
    timeline: el('timeline'), workouts: el('workouts'), mealPlan: el('mealPlan')
  };

  const toMinutes = (hhmm)=>{ const [h,m]=hhmm.split(':').map(v=>parseInt(v,10)); return h*60+m; };
  const fromMinutes = (mins)=>{ mins=((mins%(24*60))+(24*60))%(24*60); const h=Math.floor(mins/60), m=mins%60; return (h<10?'0':'')+h+':'+(m<10?'0':'')+m; };
  const round = (x,p=0)=>Number.parseFloat(x).toFixed(p);
  const clamp = (x,lo,hi)=>Math.max(lo,Math.min(hi,x));

  // تخزين محلي
  const save = ()=>{
    const data = {};
    for (const k in els){ if(els[k] && 'value' in els[k]) data[k]=els[k].value; }
    localStorage.setItem('fitnessPlannerV2', JSON.stringify(data));
  };
  const load = ()=>{
    const raw = localStorage.getItem('fitnessPlannerV2');
    if(!raw) return;
    try{
      const data = JSON.parse(raw);
      for (const k in data){ if(els[k] && 'value' in els[k]) els[k].value=data[k]; }
    }catch{}
  };

  // إظهار/إخفاء حقول حسب الهدف
  function toggleGoalFields(){
    const goal = els.goal.value;
    document.querySelectorAll('[data-show-when]').forEach(node=>{
      const cond = node.getAttribute('data-show-when');
      node.style.display = (cond===goal) ? 'block' : 'none';
    });
  }

  // حسابات المؤشرات
  function computeMetrics(){
    const weight = parseFloat(els.weight.value||0);
    const height = parseFloat(els.height.value||0);
    const age = parseFloat(els.age.value||0);
    const sex = els.sex.value;
    const activity = els.activity.value;
    const goal = els.goal.value;
    const workoutMinutes = parseInt(els.workoutMinutes.value||60,10);

    // ماء: 35 مل/كغ + 500 مل لكل 30 دقيقة تمرين
    const baseMlPerKg = 35;
    const addMl = Math.round((workoutMinutes/30) * 500);
    const waterMl = Math.round(weight * baseMlPerKg) + addMl;
    const waterLiters = clamp(waterMl/1000, 1.5, 5.0);

    // خطوات
    const stepsMap = {sedentary:6000, light:8000, moderate:10000, very:12000};
    const steps = stepsMap[activity] || 8000;

    // سعرات: Mifflin–St Jeor
    let bmr = 10*weight + 6.25*height - 5*age + (sex==='male'?5:-161);
    const af = {sedentary:1.2, light:1.375, moderate:1.55, very:1.725}[activity] || 1.55;
    let tdee = bmr * af;

    // تعديل حسب الهدف
    let adj = 0;
    if(goal==='loss') adj = -500;
    if(goal==='gain') adj = +300;
    let calories = Math.round(tdee + adj);
    calories = Math.max( (sex==='female'?1200:1400), calories );

    // ماكروز
    let proteinPerKg = goal==='loss'?2.0 : goal==='gain'?1.9 : 1.6;
    const proteinG = Math.round(clamp(proteinPerKg,1.4,2.2) * weight);
    const fatPct = goal==='loss'?0.27 : goal==='gain'?0.30 : 0.30;
    const fatKcal = Math.round(calories * fatPct);
    const fatG = Math.round(fatKcal / 9);
    const carbKcal = Math.max(0, calories - (proteinG*4 + fatG*9));
    const carbG = Math.round(carbKcal / 4);

    return {waterLiters, baseMlPerKg, addMl, steps, activity, calories, proteinG, fatG, carbG, tdee: Math.round(tdee)};
  }

  function renderKPIs(m){
    els.waterLiters.textContent = `${round(m.waterLiters,1)} لتر/اليوم`;
    els.waterDetail.textContent = `${m.baseMlPerKg} مل/كغ + ${m.addMl} مل للتمرين`;
    els.stepsTarget.textContent = m.steps.toLocaleString('ar-EG') + ' خطوة';
    const activityName = {sedentary:'منخفض', light:'خفيف', moderate:'متوسط', very:'مرتفع'}[m.activity];
    els.stepsHint.textContent = `نشاط: ${activityName}`;
    els.caloriesTarget.textContent = m.calories.toLocaleString('ar-EG') + ' ك.سعرة/يوم';
    els.proteinChip.textContent = `بروتين ${m.proteinG} غ`;
    els.fatChip.textContent = `دهون ${m.fatG} غ`;
    els.carbChip.textContent = `كارب ${m.carbG} غ`;
  }

  // خطة أسبوعية
  function weeklySplit(goal, days, focusArea, env, style){
    if(goal==='loss'){
      if(days<=3) return ['كامل الجسم + كارديو','راحة/مشي','كامل الجسم + HIIT'];
      if(days===4) return style==='lowImpact'
        ? ['قوة خفيف','كارديو منخفض التأثير','قوة خفيف','كارديو/مشي طويل']
        : ['قوة كامل','HIIT/كارديو','قوة كامل','HIIT/كارديو'];
      if(days>=5) return ['قوة علوي','قوة سفلي','HIIT/كارديو','قوة كامل','كارديو/مشّي'];
    }
    if(goal==='gain'){
      const area = {chest:'صدر',back:'ظهر',shoulders:'كتف',legs:'ساقين',arms:'ذراعين',glutes:'ألوية',core:'كور'}[focusArea] || 'عضلة';
      if(days===3) return [`${area} + كامل الجسم`,`سفلي/كور`,`علوي متنوّع`];
      if(days===4) return [`${area} (ثقيل)`,`سفلي`,`${area} (خفيف/ضخ دم)`,`علوي عام`];
      if(days>=5) return [`${area} (ثقيل)`,`سفلي`,`ظهر/سحب`,`${area} (ضخ دم/زوايا)`,`علوي/ذراعين`];
    }
    // ثبات
    if(days===3) return ['قوة كامل','كارديو/نشاط عام','قوة كامل'];
    if(days===4) return ['علوي','سفلي','نشاط عام','كامل الجسم'];
    if(days>=5) return ['كامل الجسم','كارديو','علوي','سفلي','نشاط ترفيهي'];
  }

  function renderWeekly(split, days){
    els.weeklyPlan.textContent = `${days} أيام`;
    els.splitChips.innerHTML='';
    (split||[]).forEach(s=>{
      const span = document.createElement('span');
      span.className='chip';
      span.textContent=s;
      els.splitChips.appendChild(span);
    });
  }

  // الجدول اليومي
  function buildTimeline(wake, sleep, block, minutes){
    const w = toMinutes(wake), s = toMinutes(sleep);
    let dayDur = s - w; if(dayDur <= 0) dayDur += 24*60;
    const midpoint = (ratio)=>fromMinutes(w + Math.round(dayDur*ratio));

    const breakfast = fromMinutes(w + 45);
    const lunch = midpoint(0.45);
    const dinner = fromMinutes(s - 180);
    // A
    let workoutStart;
    if(block==='morning') workoutStart = fromMinutes(w + 120);
    else if(block==='noon') workoutStart = midpoint(0.5);
    else workoutStart = fromMinutes(s - (180 + minutes));
    const workoutEnd = fromMinutes(toMinutes(workoutStart)+minutes);
    const snack = fromMinutes(toMinutes(workoutEnd)+20);

    const items = [
      {t:wake,label:'استيقاظ',detail:'ابدأ بكوب ماء 250–300 مل.',tag:'روتين'},
      {t:breakfast,label:'فطور',detail:'بروتين + كارب معقّد + دهون صحية.',tag:'وجبة'},
      {t:workoutStart,label:'تمرين',detail:`إحماء 5–10د • ${minutes}د • تبريد 5د.`,tag:'نشاط'},
      {t:workoutEnd,label:'انتهاء تمرين',detail:'سوائل + تمديد خفيف.',tag:'نشاط'},
      {t:snack,label:'وجبة خفيفة (بعد التمرين)',detail:'بروتين سريع + كارب.',tag:'وجبة'},
      {t:lunch,label:'غداء',detail:'طبق متوازن بروتين/كارب/خضار.',tag:'وجبة'},
      {t:dinner,label:'عشاء',detail:'خفيف سهل الهضم قبل النوم بـ 2–3س.',tag:'وجبة'},
      {t:sleep,label:'نوم',detail:'روتين ثابت للنوم.',tag:'روتين'},
    ].map(it=> ({...it, mins: toMinutes(it.t)}))
     .sort((a,b)=>a.mins-b.mins);

    els.timeline.innerHTML='';
    items.forEach(it=>{
      const div=document.createElement('div');
      div.className='slot';
      div.innerHTML = `
        <div class="time">${fromMinutes(it.mins)}</div>
        <div>
          <div><strong>${it.label}</strong> <span class="tag">${it.tag}</span></div>
          <div class="muted">${it.detail}</div>
        </div>`;
      els.timeline.appendChild(div);
    });
  }

  // مكتبة التمارين
  const W = {
    fatLoss: {
      home: {
        mixed: [
          {name:'Burpees', sets:'4×12', note:'شامل + رفع نبض'},
          {name:'Mountain Climbers', sets:'4×30 ثانية', note:'كور + كارديو'},
          {name:'Bodyweight Squat', sets:'4×15', note:'سفلية'},
          {name:'Push-Ups', sets:'4×AMRAP', note:'صدور/كتف/ترايسبس'},
          {name:'Plank', sets:'3×45–60 ثانية', note:'كور'}
        ],
        lowImpact: [
          {name:'Marching in Place', sets:'5×1 دقيقة', note:'منخفض التأثير'},
          {name:'Step-Ups على درج', sets:'4×12/رجل', note:'قوة + نبض'},
          {name:'Glute Bridge', sets:'4×15', note:'ألوية/أسفل الظهر'},
          {name:'Wall Push-Ups', sets:'4×15', note:'خفيف للمبتدئ'},
          {name:'Side Plank', sets:'3×30 ثانية/جانب', note:'كور جانبي'}
        ],
        cardio: [
          {name:'مشي سريع', sets:'30–45 دقيقة', note:'منخفض الشدة'},
          {name:'حبل قفز', sets:'Intervals 10×45 ثانية', note:'HIIT منزلي'},
          {name:'درج/نطّة', sets:'20–30 دقيقة', note:'سفلية + نبض'}
        ]
      },
      gym: {
        mixed: [
          {name:'Treadmill Intervals', sets:'10×1د سريع/1د بطيء', note:'HIIT'},
          {name:'Goblet Squat', sets:'4×12', note:'ساقين'},
          {name:'Lat Pulldown', sets:'4×12', note:'ظهر'},
          {name:'DB Bench Press', sets:'4×10', note:'صدر'},
          {name:'Cable Woodchop', sets:'3×12/جانب', note:'كور'}
        ],
        lowImpact: [
          {name:'Elliptical', sets:'30–40 دقيقة', note:'مفاصل مريحة'},
          {name:'Leg Press خفيف', sets:'4×15', note:'ساقين'},
          {name:'Seated Row', sets:'4×12', note:'ظهر'},
          {name:'Pec Deck خفيف', sets:'3×15', note:'صدر'},
          {name:'Plank Variations', sets:'3×45–60 ثانية', note:'كور'}
        ],
        cardio: [
          {name:'دراجة ثابتة', sets:'30–45 دقيقة', note:'ثابت/Intervals'},
          {name:'Treadmill Incline Walk', sets:'20–30 دقيقة', note:'ميل 6–10%'},
          {name:'Rowing Machine', sets:'15–20 دقيقة', note:'شامل'}
        ]
      }
    },
    gain: {
      chest: [
        {name:'Barbell Bench Press', sets:'5×5 ثقيل'},
        {name:'Incline DB Press', sets:'4×8–10'},
        {name:'Cable Fly', sets:'3×12–15'},
        {name:'Push-Ups', sets:'3×AMRAP'}
      ],
      back: [
        {name:'Deadlift', sets:'5×3–5'},
        {name:'Lat Pulldown / Pull-Ups', sets:'4×8–10'},
        {name:'Barbell Row', sets:'4×6–8'},
        {name:'Face Pulls', sets:'3×12–15'}
      ],
      shoulders: [
        {name:'Overhead Press', sets:'5×5'},
        {name:'Lateral Raise', sets:'4×12–15'},
        {name:'Rear Delt Fly', sets:'3×12–15'},
        {name:'Arnold Press', sets:'3×8–10'}
      ],
      legs: [
        {name:'Back Squat', sets:'5×5'},
        {name:'Romanian Deadlift', sets:'4×6–8'},
        {name:'Lunges', sets:'3×10/رجل'},
        {name:'Calf Raise', sets:'4×12–15'}
      ],
      arms: [
        {name:'Barbell Curl', sets:'4×8–12'},
        {name:'Triceps Pushdown', sets:'4×10–12'},
        {name:'Incline DB Curl', sets:'3×10–12'},
        {name:'Overhead Triceps Ext.', sets:'3×10–12'}
      ],
      glutes: [
        {name:'Hip Thrust', sets:'5×5–8'},
        {name:'Bulgarian Split Squat', sets:'3×8/رجل'},
        {name:'Cable Kickback', sets:'3×12–15'},
        {name:'Sumo Deadlift', sets:'3×5–8'}
      ],
      core: [
        {name:'Hanging Leg Raise', sets:'4×10–12'},
        {name:'Weighted Plank', sets:'3×45–60 ثانية'},
        {name:'Cable Crunch', sets:'3×12–15'},
        {name:'Pallof Press', sets:'3×12/جانب'}
      ],
      generalUpper: [
        {name:'Bench Press', sets:'4×6–8'},
        {name:'Row', sets:'4×8–10'},
        {name:'OHP', sets:'3×6–8'},
        {name:'Lat Pulldown', sets:'3×10–12'}
      ],
      generalLower: [
        {name:'Squat', sets:'4×6–8'},
        {name:'RDL', sets:'4×8–10'},
        {name:'Leg Press', sets:'3×10–12'},
        {name:'Calf Raise', sets:'4×12–15'}
      ]
    },
    maintain: {
      general: [
        {name:'Full Body Strength (خفيف-متوسط)', sets:'3×10 لكل تمرين'},
        {name:'Cardio معتدل (مشي/دراجة)', sets:'25–35 دقيقة'},
        {name:'Mobility/Stretch', sets:'10 دقائق'}
      ]
    }
  };

  function renderWorkouts(goal, env, style, days, focusArea){
    const container = els.workouts;
    container.innerHTML='';

    if(goal==='loss'){
      const pack = (W.fatLoss[env] && W.fatLoss[env][style]) ? W.fatLoss[env][style] : [];
      const alt = (style!=='cardio')
        ? ((W.fatLoss[env] && W.fatLoss[env].cardio) ? W.fatLoss[env].cardio : [])
        : ((W.fatLoss[env] && W.fatLoss[env].mixed) ? W.fatLoss[env].mixed : []);
      const dayA = pack.slice(0,5);
      const dayB = alt.slice(0,5);

      const cardA = document.createElement('div');
      cardA.className='card';
      cardA.innerHTML = `
        <h3 class="sub">اليوم (A) — حرق دهون ${env==='home'?'— المنزل':'— النادي'} <span class="badge">${style}</span></h3>
        <ul class="list">${dayA.map(ex=>`<li><strong>${ex.name}</strong> — ${ex.sets} <span class="muted">${ex.note||''}</span></li>`).join('')}</ul>
      `;
      const cardB = document.createElement('div');
      cardB.className='card';
      cardB.innerHTML = `
        <h3 class="sub">اليوم (B) — كارديو/Intervals</h3>
        <ul class="list">${dayB.map(ex=>`<li><strong>${ex.name}</strong> — ${ex.sets} <span class="muted">${ex.note||''}</span></li>`).join('')}</ul>
      `;

      const freq = days>=5 ? 'التناوب: A/B/A/B/A' : days===4 ? 'التناوب: A/B/A/B' : 'التناوب: A/B/A';
      const note = document.createElement('div');
      note.className='muted'; note.style.marginTop='8px';
      note.textContent = `اقتراح أسبوعي (${days} أيام): ${freq} — مع يوم/يومين راحة نشطة (مشي/مرونة).`;
      container.appendChild(cardA); container.appendChild(cardB); container.appendChild(note);
    }
    else if(goal==='gain'){
      const areaMap = W.gain[focusArea] || W.gain.chest;
      const areaName = {chest:'صدر',back:'ظهر',shoulders:'كتف',legs:'ساقين',arms:'ذراعين',glutes:'ألوية',core:'كور'}[focusArea] || 'عضلة';
      const card1 = document.createElement('div');
      card1.className='card';
      card1.innerHTML = `
        <h3 class="sub">اليوم (1) — ${areaName} (أولوية ثقيل)</h3>
        <ul class="list">${areaMap.map(ex=>`<li><strong>${ex.name}</strong> — ${ex.sets}</li>`).join('')}</ul>
      `;
      const card2 = document.createElement('div');
      card2.className='card';
      card2.innerHTML = `
        <h3 class="sub">اليوم (2) — علوي عام</h3>
        <ul class="list">${W.gain.generalUpper.map(ex=>`<li><strong>${ex.name}</strong> — ${ex.sets}</li>`).join('')}</ul>
      `;
      const card3 = document.createElement('div');
      card3.className='card';
      card3.innerHTML = `
        <h3 class="sub">اليوم (3) — سفلي</h3>
        <ul class="list">${W.gain.generalLower.map(ex=>`<li><strong>${ex.name}</strong> — ${ex.sets}</li>`).join('')}</ul>
      `;
      const card4 = document.createElement('div');
      card4.className='card';
      card4.innerHTML = `
        <h3 class="sub">اليوم (4) — ${areaName} (ضخ دم/زوايا)</h3>
        <ul class="list">${areaMap.map(ex=>`<li><strong>${ex.name}</strong> — ${ex.sets.replace('5×5','4×10').replace('3×5–8','3×10–12')}</li>`).join('')}</ul>
      `;

      container.appendChild(card1); container.appendChild(card2); container.appendChild(card3);
      if (parseInt(els.daysPerWeek.value,10)>=4) container.appendChild(card4);

      const note = document.createElement('div');
      note.className='muted'; note.style.marginTop='8px';
      note.innerHTML = `ركّز على <span class="badge">تغذية كافية</span> و<span class="badge">زيادة تدريجية</span> و<span class="badge">نوم 7–9 ساعات</span>.`;
      container.appendChild(note);
    }
    else {
      const card = document.createElement('div');
      card.className='card';
      card.innerHTML = `
        <h3 class="sub">روتين متوازن (3–5 أيام)</h3>
        <ul class="list">
          <li><strong>قوة كامل الجسم</strong> — سكوات، ضغط، سحب، هيب هنج (3×10 لكل تمرين).</li>
          <li><strong>كارديو معتدل</strong> — مشي/دراجة 25–35 دقيقة، 2–3 مرات.</li>
          <li><strong>مرونة/حركة</strong> — 10 دقائق بعد كل تمرين.</li>
        </ul>
      `;
      const tip = document.createElement('div');
      tip.className='muted'; tip.style.marginTop='8px';
      tip.textContent = 'حافظ على سعرات مقاربة لـ TDEE، وتتبع الوزن أسبوعيًا (±0.3 كغ) وعدّل 100–150 سعرة حسب الحاجة.';
      container.appendChild(card); container.appendChild(tip);
    }
  }

  // الخطة الغذائية (7 أيام × 4 وجبات)
  function renderMealPlan(calories, proteinG, fatG, carbG){
    const meals = {
      breakfast: [
        'شوفان 60غ + حليب قليل الدسم + موزة + 2 بيض',
        'زبادي يوناني 200غ +  او زبادي بروتين 15غ + توت + عسل ملعقة صغيرة',
        'خبز بر (2) + لبنة خفيفة + خضار + 1 بيض'
      ],
      lunch: [
        'صدر دجاج 180غ + أرز بني 150غ مطبوخ + سلطة + زيت زيتون ملعقة',
        'سمك مشوي 180غ + بطاطس مشوية 250غ + خضار ه',
        'لحم بقري خفيف 150غ + برغل/لحم او دجاج/ 150غ + تبولة'
      ],
      snack: [
        'بروتين شيك (25–30غ) + موز/تفاح',
        'جبن قريش 200غ + خبز عربي بر صغير',
        'تمر 3–4 + زبادي قليل الدسم 180غ'
      ],
      dinner: [
        'تونة/سلمون 150غ + سلطة كبيرة + خبز بر صغير',
        'بيضتان + أفوكادو ربع + خضار مشوية + لبن رائب',
        'شوربة عدس 300مل + سلطة خفيفة'
      ]
    };
    const dist = {breakfast:.25, lunch:.35, snack:.15, dinner:.25};
    const macroSplit = (p)=>({
      kcal: Math.round(calories*p),
      p: Math.round(proteinG*p),
      f: Math.round(fatG*p),
      c: Math.round(carbG*p),
    });

    const blocks = ['breakfast','lunch','snack','dinner'];
    els.mealPlan.innerHTML = '';
    for(let day=1; day<=7; day++){
      const dayWrap = document.createElement('div');
      dayWrap.className='card';
      dayWrap.innerHTML = `<h3 class="sub">اليوم ${day}</h3>`;
      const inner = document.createElement('div');
      blocks.forEach((b,idx)=>{
        const m = macroSplit(dist[b]);
        const option = meals[b][(day+idx)%meals[b].length];
        const section = document.createElement('div');
        section.style.marginTop='6px';
        const title = {breakfast:'إفطار', lunch:'غداء', snack:'وجبة خفيفة', dinner:'عشاء'}[b];
        section.innerHTML = `
          <div class="chips" style="margin-bottom:2px;">
            <span class="chip">${title}</span>
            <span class="chip">~ ${m.kcal} ك.سعرة</span>
            <span class="chip">P ${m.p}غ</span>
            <span class="chip">F ${m.f}غ</span>
            <span class="chip">C ${m.c}غ</span>
          </div>
          <div class="muted">${option}</div>
        `;
        inner.appendChild(section);
      });
      dayWrap.appendChild(inner);
      els.mealPlan.appendChild(dayWrap);
    }
  }

  // بناء الخطة كاملة
  function buildPlan(){
    toggleGoalFields();

    const goal = els.goal.value;
    const focusArea = els.focusArea ? els.focusArea.value : 'chest';
    const env = els.environment.value;
    const style = els.fatLossStyle ? els.fatLossStyle.value : 'mixed';
    const days = parseInt(els.daysPerWeek.value||4,10);
    const wake = els.wake.value, sleep = els.sleep.value;
    const block = els.workoutTime.value;
    const minutes = parseInt(els.workoutMinutes.value||60,10);

    const m = computeMetrics();
    renderKPIs(m);

    const split = weeklySplit(goal, days, focusArea, env, style);
    renderWeekly(split, days);

    buildTimeline(wake, sleep, block, minutes);
    renderWorkouts(goal, env, style, days, focusArea);
    renderMealPlan(m.calories, m.proteinG, m.fatG, m.carbG);

    save();
  }

  // أحداث
  document.querySelectorAll('input,select').forEach(x=>x.addEventListener('change', save));
  els.updateBtn.addEventListener('click', buildPlan);
  els.printBtn.addEventListener('click', ()=>window.print());
  els.resetBtn.addEventListener('click', ()=>{ localStorage.removeItem('fitnessPlannerV2'); window.location.reload(); });
  els.goal.addEventListener('change', toggleGoalFields);

  // تهيئة
  load(); toggleGoalFields(); buildPlan();
})();