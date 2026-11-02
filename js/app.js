/* הפרשה של נבו: לימוד פרשת שופטים לבר מצווה. Vanilla JS, no build step. */
(() => {
  'use strict';
  const P = window.PARASHA;
  const TA = window.TEAMIM_AUDIO;

  // ---------- helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(3)) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : String(kid));
    return el;
  }
  const dateStr = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const todayStr = () => dateStr(new Date());
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function heNum(n) {
    const ones = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
    const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
    let s = '';
    if (n === 15) s = 'טו'; else if (n === 16) s = 'טז'; else s = tens[Math.floor(n / 10)] + ones[n % 10];
    return s.length > 1 ? s.slice(0, -1) + '״' + s.slice(-1) : s + '׳';
  }
  const fmtDate = iso => { const [y, m, d] = iso.split('-'); return `${+d}.${+m}.${y}`; };
  function daysUntil(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.round((new Date(y, m - 1, d) - now) / 86400000);
  }

  const ICON = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.6v12.8a1 1 0 0 0 1.53.85l10.2-6.4a1 1 0 0 0 0-1.7L9.53 4.75A1 1 0 0 0 8 5.6z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.3" height="14" rx="1.4"/><rect x="13.7" y="5" width="4.3" height="14" rx="1.4"/></svg>',
    toLeft: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4.5" y="5.5" width="2.6" height="13" rx="1"/><path d="M9 12l9.3 6.2a.6.6 0 0 0 .9-.5V6.3a.6.6 0 0 0-.9-.5z"/></svg>',
    toRight: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="16.9" y="5.5" width="2.6" height="13" rx="1"/><path d="M15 12L5.7 5.8a.6.6 0 0 0-.9.5v11.4a.6.6 0 0 0 .9.5z"/></svg>',
    loop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2.5l3 3-3 3"/><path d="M4 11.5v-2a4 4 0 0 1 4-4h12"/><path d="M7 21.5l-3-3 3-3"/><path d="M20 12.5v2a4 4 0 0 1-4 4H4"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5"/></svg>',
    stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>',
  };

  // ---------- te'amim catalogue ----------
  // fam = colour family (a ruler and the servants that lead into it share it); dis = disjunctive ("מפסיק")
  const T = {
    sofpasuk:   { name: 'סוֹף פָּסוּק', fam: 'sof', dis: 1, rank: 1, label: 'סוֹף פָּסֽוּק׃' },
    etnachta:   { name: 'אֶתְנַחְתָּא', mark: '֑', fam: 'etnach', dis: 1, rank: 2, label: 'אֶתְנַחְתָּ֑א' },
    segol:      { name: 'סֶגּוֹל', mark: '֒', pos: 'post', fam: 'segol', dis: 1, rank: 3, label: 'סֶגּוֹל֒' },
    shalshelet: { name: 'שַׁלְשֶׁלֶת', mark: '֓', fam: 'segol', dis: 1, rank: 3, label: 'שַׁלְשֶׁ֓לֶת' },
    katon:      { name: 'זָקֵף קָטוֹן', mark: '֔', fam: 'zakef', dis: 1, rank: 4, label: 'קָט֔וֹן' },
    gadol:      { name: 'זָקֵף גָּדוֹל', mark: '֕', fam: 'zakef', dis: 1, rank: 4, label: 'זָקֵף גָּד֕וֹל' },
    tipcha:     { name: 'טִפְּחָא', mark: '֖', fam: 'tipcha', dis: 1, rank: 5, label: 'טִפְּחָ֖א' },
    revii:      { name: 'רְבִיעִי', mark: '֗', fam: 'revii', dis: 1, rank: 6, label: 'רְבִ֗יעִי' },
    zarka:      { name: 'זַרְקָא', mark: '֮', alt: '֘', pos: 'post', fam: 'segol', dis: 1, rank: 7, label: 'זַרְקָא֮' },
    pashta:     { name: 'פַּשְׁטָא', mark: '֙', pos: 'post', fam: 'pashta', dis: 1, rank: 8, label: 'פַּשְׁטָא֙' },
    yetiv:      { name: 'יְתִיב', mark: '֚', pos: 'pre', fam: 'yetiv', dis: 1, rank: 8, label: 'יְ֚תִיב' },
    tevir:      { name: 'תְּבִיר', mark: '֛', fam: 'tevir', dis: 1, rank: 9, label: 'תְּבִ֛יר' },
    geresh:     { name: 'אַזְלָא גֵּרֵשׁ', mark: '֜', fam: 'geresh', dis: 1, rank: 10, label: 'אַזְלָא גֵּרֵ֜שׁ' },
    gershayim:  { name: 'גֵּרְשַׁיִם', mark: '֞', fam: 'geresh', dis: 1, rank: 10, label: 'גֵּרְשַׁ֞יִם' },
    pazer:      { name: 'פָּזֵר', mark: '֡', fam: 'pazer', dis: 1, rank: 11, label: 'פָּזֵ֡ר' },
    telishaG:   { name: 'תְּלִישָׁא גְדוֹלָה', mark: '֠', pos: 'pre', fam: 'pazer', dis: 1, rank: 11, label: 'תְּ֠לִישָׁא גְדוֹלָה' },
    legarmeh:   { name: 'מוּנַח לְגַרְמֵהּ', fam: 'pazer', dis: 1, rank: 11, hidden: 1 },
    munach:     { name: 'מוּנַח', mark: '֣', fam: 'serv', dis: 0, label: 'מוּנַ֣ח' },
    mahpach:    { name: 'מַהְפַּךְ', mark: '֤', fam: 'serv', dis: 0, label: 'מַהְפַּ֤ךְ' },
    mercha:     { name: 'מֵרְכָא', mark: '֥', fam: 'serv', dis: 0, label: 'מֵרְכָ֥א' },
    darga:      { name: 'דַּרְגָּא', mark: '֧', fam: 'serv', dis: 0, label: 'דַּרְגָּ֧א' },
    kadma:      { name: 'קַדְמָא', mark: '֨', fam: 'serv', dis: 0, label: 'קַדְמָ֨א' },
    telishaK:   { name: 'תְּלִישָׁא קְטַנָּה', mark: '֩', pos: 'post', fam: 'serv', dis: 0, label: 'תְּלִישָׁא קְטַנָּה֩' },
  };
  const MARK_IDS = Object.keys(T).filter(id => T[id].mark);
  const QUIZ_IDS = Object.keys(T).filter(id => !T[id].hidden);
  const famOf = id => (T[id].dis ? T[id].fam : 'serv');
  const PART = id => (id === 'azla' ? { id: 'geresh', label: 'וְאַזְלָ֜א' } : { id, label: T[id].label });

  // the ta'am written on the word "נְבוֹ", placed where it belongs (before / on the stress / after)
  function carrier(id) {
    const d = T[id];
    if (id === 'sofpasuk') return 'נְבֽוֹ׃';
    if (d.pos === 'post') return 'נְבוֹ' + d.mark;
    if (d.pos === 'pre') return 'נְ' + d.mark + 'בוֹ';
    return 'נְב' + d.mark + 'וֹ';
  }

  function analyse(t, paseq) {
    const ids = MARK_IDS.filter(id => t.includes(T[id].mark) || (T[id].alt && t.includes(T[id].alt)));
    if (t.includes('׃')) ids.push('sofpasuk');
    const dis = ids.filter(id => T[id].dis).sort((a, b) => T[a].rank - T[b].rank);
    let pri = null;
    if (dis.length) pri = dis[0];
    else if (paseq && ids.includes('munach')) pri = 'legarmeh';
    else pri = ids[0] || null;
    return { ids, pri };
  }

  const VERSES = P.verses.map((v, idx) => {
    const words = v.w.map(w => {
      const o = typeof w === 'string' ? { t: w } : { t: w.t, k: w.k, p: w.p };
      Object.assign(o, analyse(o.t, o.p));
      o.st = (o.k || o.t).replace(/־/g, ' ').replace(/[֑-ׇ]/g, '');
      return o;
    });
    let next = 'sof';
    for (let i = words.length - 1; i >= 0; i--) {
      const w = words[i];
      const isDis = w.pri && T[w.pri].dis;
      if (isDis) next = T[w.pri].fam;
      w.fam = isDis ? T[w.pri].fam : next;
    }
    return Object.assign({}, v, { idx, key: v.c + ':' + v.v, words });
  });
  const inRange = (v, a, b) => (v.c > a[0] || (v.c === a[0] && v.v >= a[1])) && (v.c < b[0] || (v.c === b[0] && v.v <= b[1]));
  const aliyahVerses = n => { const al = P.aliyot[n - 1]; return VERSES.filter(v => inRange(v, al.from, al.to)); };
  const aliyahOf = v => P.aliyot.find(a => !a.maftir && inRange(v, a.from, a.to));
  const COUNTS = {};
  VERSES.forEach(v => v.words.forEach(w => w.ids.forEach(id => { COUNTS[id] = (COUNTS[id] || 0) + 1; })));

  // phrases of the te'amim song, with colours: servants take the colour of the next ruler
  const PHRASES = TA.map((ph, i) => {
    const parts = ph.parts.map(p => Object.assign(PART(p[0]), { s: p[1], e: p[2] }));
    let next = 'serv';
    for (let k = parts.length - 1; k >= 0; k--) {
      const d = T[parts[k].id];
      if (d.dis) next = d.fam;
      parts[k].fam = d.dis ? d.fam : next;
    }
    const acc = parts.filter(p => T[p.id].dis).map(p => p.fam).pop() || 'serv';
    return { i, file: ph.file, dur: ph.dur, parts, acc };
  });
  // where to hear each ta'am alone: prefer a phrase that is only that ta'am, else its first appearance
  const SAMPLE = {};
  PHRASES.forEach(ph => ph.parts.forEach((p, k) => {
    const solo = ph.parts.every(q => q.id === p.id);
    if (!SAMPLE[p.id] || (solo && !SAMPLE[p.id].solo)) SAMPLE[p.id] = { ph: ph.i, k, solo };
  }));

  // ---------- state ----------
  const KEY = 'nevo-parasha-v1';
  const defaults = () => ({ xp: 0, streak: 0, lastDay: null, days: {}, heard: {}, verses: {}, mastery: {}, recs: {}, games: {}, badges: {}, quest: {}, lastAliyah: 1, set: { view: 'tm', colors: false, speed: 1, sfx: true } });
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}');
      const d = defaults();
      return Object.assign(d, s, { set: Object.assign(d.set, s.set || {}) });
    } catch (e) { return defaults(); }
  }
  const S = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode */ } }

  const LEVELS = [
    [0, 'טירון'], [60, 'שומע טעמים'], [150, 'מזמזם'], [300, 'קורא צעיר'], [500, 'בעל קורא מתחיל'],
    [800, 'בעל קורא'], [1200, 'אלוף הטעמים'], [1700, 'מלך הבימה'], [2400, 'חזן על'], [3200, 'מוכן לבר מצווה 👑'],
  ];
  const levelOf = xp => { let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++; return i; };

  const BADGES = [
    { id: 'ears', i: '🎧', n: 'אוזן מוזיקלית', d: 'שמעת את כל שיר הטעמים' },
    { id: 'rishon', i: '📜', n: 'ראשון!', d: 'שמעת את כל עליית ראשון' },
    { id: 'sniper', i: '🎯', n: 'צלף', d: '5 תשובות נכונות ברצף' },
    { id: 'perfect', i: '💯', n: 'מושלם', d: '10 מתוך 10 בחידון' },
    { id: 'hunter', i: '🔍', n: 'צייד', d: 'מצאת 25 טעמים בצייד' },
    { id: 'elephant', i: '🐘', n: 'זיכרון של פיל', d: 'ניצחת בזיכרון ב-14 מהלכים או פחות' },
    { id: 'mic', i: '🎤', n: 'על הבמה', d: 'הקלטת את עצמך קורא' },
    { id: 'torah', i: '🕍', n: 'קורא מהספר', d: 'עלייה שלמה באתגר ספר תורה' },
    { id: 'turtle', i: '🐢', n: 'לאט ובטוח', d: 'תרגלת בקצב איטי' },
    { id: 'streak3', i: '🔥', n: 'רצף 3', d: '3 ימים ברצף' },
    { id: 'streak7', i: '🚀', n: 'רצף 7', d: '7 ימים ברצף' },
    { id: 'level5', i: '🏅', n: 'חצי הדרך', d: 'הגעת לרמה 5' },
  ];
  const QUESTS = [
    { ev: 'teamim', goal: 5, t: 'חמישה טעמים', d: 'שמע 5 צירופים משיר הטעמים', i: '🎵' },
    { ev: 'quiz', goal: 1, t: 'חידון', d: 'סיים סבב של "מה הטעם?"', i: '🎯' },
    { ev: 'verse', goal: 5, t: 'חמישה פסוקים', d: 'האזן ל-5 פסוקים מהפרשה', i: '📜' },
    { ev: 'torah', goal: 3, t: 'מהספר', d: 'קרא 3 פסוקים באתגר ספר תורה', i: '🕍' },
    { ev: 'hunt', goal: 1, t: 'ציד', d: 'סיים משחק של צייד טעמים', i: '🔍' },
    { ev: 'memory', goal: 1, t: 'זיכרון', d: 'נצח במשחק הזיכרון', i: '🃏' },
  ];
  function todayQuest() {
    const day = Math.floor(new Date(todayStr()).getTime() / 86400000);
    const q = QUESTS[((day % QUESTS.length) + QUESTS.length) % QUESTS.length];
    if (S.quest.day !== todayStr()) S.quest = { day: todayStr(), n: 0, done: false };
    return q;
  }

  // ---------- feedback: sound, toasts, confetti, modal ----------
  const sfx = (() => {
    let ctx = null;
    const c = () => { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; ctx = A ? new A() : null; } return ctx; };
    function tone(f, t0, dur, type = 'sine', g = 0.14) {
      const a = c(); if (!a || !S.set.sfx) return;
      if (a.state === 'suspended') a.resume();
      const o = a.createOscillator(), gn = a.createGain();
      o.type = type; o.frequency.value = f;
      const t = a.currentTime + t0;
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(g, t + 0.012);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(gn).connect(a.destination);
      o.start(t); o.stop(t + dur + 0.03);
    }
    return {
      ok() { tone(660, 0, 0.13); tone(990, 0.09, 0.2); },
      bad() { tone(196, 0, 0.22, 'square', 0.06); tone(147, 0.12, 0.25, 'square', 0.06); },
      up() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, 'triangle', 0.15)); },
      flip() { tone(1200, 0, 0.05, 'sine', 0.05); },
    };
  })();

  function toast(msg, cls = '') {
    const el = h('div', { class: 'toast ' + cls }, msg);
    $('#toasts').append(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, 1900);
  }

  // one canvas and one animation loop shared by every burst
  const confettiPs = [];
  let confettiOn = false;
  function confetti(n = 150, from = null) {
    if (reduceMotion) return;
    const W = innerWidth, H = innerHeight;
    const colors = ['#5B3DF5', '#FFC531', '#1FC46B', '#FF5A5F', '#2FB5F5', '#FF8A3D', '#D6337F'];
    const ox = from ? from.x : W / 2, oy = from ? from.y : H * 0.38, spread = from ? 0.55 : 1;
    const born = performance.now();
    for (let i = 0; i < n; i++) confettiPs.push({
      x: ox + (Math.random() - 0.5) * (from ? 30 : 120), y: oy,
      vx: (Math.random() - 0.5) * 13 * spread, vy: -Math.random() * 14 * spread - 4,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35,
      w: 6 + Math.random() * 6, hh: 9 + Math.random() * 8, c: pick(colors), born,
    });
    if (confettiOn) return;
    confettiOn = true;
    const cv = $('#confetti'), ctx = cv.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr;
    (function frame(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      for (let i = confettiPs.length - 1; i >= 0; i--) {
        const p = confettiPs[i];
        p.vy += 0.33; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        if (t - p.born > 2800 || p.y > H + 40) { confettiPs.splice(i, 1); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.hh / 2, p.w, p.hh * Math.cos(p.r * 1.7));
        ctx.restore();
      }
      if (confettiPs.length) requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, W, H); confettiOn = false; }
    })(performance.now());
  }

  function modal({ icon, title, text, btn = 'יאללה!' }) {
    return new Promise(res => {
      const bg = h('div', { class: 'modal-bg' },
        h('div', { class: 'modal', role: 'dialog' },
          h('div', { class: 'mi' }, icon), h('div', { class: 'mt' }, title),
          text ? h('div', { class: 'md' }, text) : null,
          h('button', { class: 'btn block', onclick: () => { bg.remove(); res(); } }, btn)));
      document.body.append(bg);
    });
  }

  // ---------- xp, streak, badges, quest ----------
  function renderStats(bump) {
    $('#xpNum').textContent = S.xp;
    $('#streakNum').textContent = S.streak;
    if (bump) { const c = $('#xpChip'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
  }
  function touchDay(n) {
    const t = todayStr();
    if (S.lastDay !== t) {
      const y = new Date(); y.setDate(y.getDate() - 1);
      S.streak = S.lastDay === dateStr(y) ? S.streak + 1 : 1;
      S.lastDay = t;
      if (S.streak >= 3) badge('streak3');
      if (S.streak >= 7) badge('streak7');
    }
    S.days[t] = (S.days[t] || 0) + n;
  }
  function addXP(n, why) {
    if (!(n > 0)) return;
    const before = levelOf(S.xp);
    S.xp += n;
    touchDay(n);
    save(); renderStats(true);
    toast(`+${n} ⭐${why ? ' ' + why : ''}`, 'xp');
    const after = levelOf(S.xp);
    if (after > before) {
      if (after >= 4) badge('level5');
      setTimeout(() => { sfx.up(); confetti(); modal({ icon: '🎉', title: `עלית לרמה ${after + 1}!`, text: LEVELS[after][1], btn: 'אש!' }); }, 650);
    }
  }
  function badge(id) {
    if (S.badges[id]) return;
    S.badges[id] = todayStr(); save();
    const b = BADGES.find(x => x.id === id);
    if (b) setTimeout(() => { toast(`${b.i} תג חדש: ${b.n}`); sfx.up(); }, 900);
  }
  function questEvent(ev, n = 1) {
    const q = todayQuest();
    if (q.ev !== ev || S.quest.done) return;
    S.quest.n = Math.min(q.goal, S.quest.n + n);
    if (S.quest.n >= q.goal) {
      S.quest.done = true; save();
      setTimeout(() => { confetti(); toast('🎯 המשימה של היום הושלמה!'); addXP(50, 'משימה יומית'); }, 500);
    } else save();
  }

  // ---------- audio ----------
  function seekAndPlay(a, s) {
    const seek = () => { try { a.currentTime = s; } catch (e) { /* not ready */ } };
    if (a.readyState >= 1) { seek(); return a.play(); }
    a.muted = s > 0.05;
    const p = a.play();
    a.addEventListener('loadedmetadata', () => {
      seek();
      if (!a.muted) return;
      if (a.seeking) a.addEventListener('seeked', () => { a.muted = false; }, { once: true });
      else a.muted = false;
      setTimeout(() => { a.muted = false; }, 1500);
    }, { once: true });
    return p;
  }

  // plays [s, e] of a file, reports the time while playing
  const clip = (() => {
    const a = new Audio();
    a.preload = 'auto';
    let raf = 0, end = 0, onTick = null, onDone = null, token = 0;
    a.addEventListener('timeupdate', () => {
      if (!onDone) return;
      if (onTick) onTick(a.currentTime);
      if (a.currentTime >= end - 0.02) finish(false);
    });
    function finish(interrupted) {
      cancelAnimationFrame(raf); raf = 0;
      if (!a.paused) a.pause();
      const d = onDone; onDone = null; onTick = null;
      if (d) d(interrupted);
    }
    function loop() {
      const t = a.currentTime;
      if (onTick) onTick(t);
      if (t >= end - 0.02 || a.ended) { finish(false); return; }
      raf = requestAnimationFrame(loop);
    }
    function play(src, s, e, opts = {}) {
      stopReader();
      finish(true);
      const my = ++token;
      if (!a.src || !a.src.endsWith(src)) a.src = src;
      a.playbackRate = opts.rate || 1;
      a.preservesPitch = true; a.webkitPreservesPitch = true;
      end = e; onTick = opts.tick || null; onDone = opts.done || null;
      const p = seekAndPlay(a, s);
      if (p && p.then) p.then(() => { if (my === token) { cancelAnimationFrame(raf); loop(); } }).catch(() => { if (my === token) finish(true); });
      else loop();
    }
    return { play, stop: () => finish(true), playing: () => !!onDone };
  })();

  function playSample(id, done) {
    const sm = SAMPLE[id];
    if (!sm) return false;
    const ph = PHRASES[sm.ph], p = ph.parts[sm.k];
    clip.play(ph.file, p.s, p.e, { done });
    return true;
  }
  function wordClip(v, wi) {
    const al = aliyahOf(v);
    if (!al || !al.audio || !v.ws) return null;
    return { src: al.audio, s: v.ws[wi], e: wi + 1 < v.ws.length ? v.ws[wi + 1] : v.e };
  }

  let stopReader = () => {};
  function stopAll() { clip.stop(); stopReader(); playAllToken++; }
  let playAllToken = 0;

  // ---------- word bubble ----------
  let bubbleTimer = 0;
  function closeBubble() { clearTimeout(bubbleTimer); $$('.bubble').forEach(b => b.remove()); }
  function showBubble(container, wordEl, { word, title, note, ms = 2600 }) {
    closeBubble();
    const b = h('div', { class: 'bubble' }, word ? h('div', { class: 'bw tm' }, word) : null, title ? h('div', { class: 'bt' }, title) : null, note ? h('div', { class: 'bk' }, note) : null);
    container.append(b);
    const r = wordEl.getBoundingClientRect(), c = container.getBoundingClientRect();
    const x = r.left + r.width / 2 - c.left;
    const half = Math.min(b.offsetWidth / 2, c.width / 2 - 4);
    const cx = Math.max(half + 4, Math.min(c.width - half - 4, x));
    b.style.left = cx + 'px';
    b.style.top = (r.top - c.top - 6) + 'px';
    b.style.setProperty('--ax', `calc(50% + ${x - cx}px)`);
    bubbleTimer = setTimeout(closeBubble, ms);
  }
  const taamNames = w => {
    const names = w.ids.map(id => T[id].name);
    if (w.pri === 'legarmeh') return 'מוּנַח לְגַרְמֵהּ (עם פָּסֵק)';
    return names.length ? names.join(' + ') : 'בלי טעם (מחובר במקף)';
  };

  // ---------- text rendering ----------
  function buildText(vs, { filter = null } = {}) {
    const text = h('div', { class: 'text tm' + (S.set.colors ? ' colors' : '') });
    if (filter) text.style.setProperty('--hc', `var(--t-${famOf(filter)})`);
    let lastC = null;
    vs.forEach((v, vi) => {
      const ve = h('span', { class: 'vs', 'data-vi': vi });
      if (v.c !== lastC) { ve.append(h('span', { class: 'chap' }, `פרק ${heNum(v.c)}`)); lastC = v.c; }
      ve.append(h('span', { class: 'vn' }, heNum(v.v)));
      v.words.forEach((w, wi) => {
        const cls = 'w' + (w.k ? ' kq' : '') + (filter && w.ids.includes(filter) ? ' hit' : '');
        ve.append(h('span', { class: cls, 'data-wi': wi, style: `--pc:var(--t-${w.fam})` },
          h('span', { class: 'tmw' }, w.t), h('span', { class: 'st' }, w.st)));
        if (w.p) ve.append(h('span', { class: 'paseq' }, ' ׀'));
        ve.append(' ');
      });
      if (v.brk) ve.append(h('span', { class: 'brk' }, v.brk), h('span', { class: v.brk === 'פ' ? 'petucha' : 'setuma' }));
      text.append(ve, ' ');
    });
    return text;
  }

  // ---------- router ----------
  function route() {
    stopAll();
    closeBubble();
    unmountPlayer();
    document.body.classList.remove('game-mode');
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const name = parts[0] || '';
    const tab = name === 'game' ? 'games' : (name || 'home');
    $$('.tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
    updateReadTab();
    const view = $('#view');
    view.innerHTML = '';
    window.scrollTo(0, 0);
    const fn = { '': renderHome, teamim: renderTeamim, read: renderReader, games: renderGames, game: renderGame }[name] || renderHome;
    fn(view, parts);
  }
  function updateReadTab() { const a = $('.tabs a[data-tab=read]'); if (a) a.href = `#/read/${S.lastAliyah || 1}`; }

  // ---------- home ----------
  function aliyahStars(n) {
    const vs = aliyahVerses(n), al = P.aliyot[n - 1];
    const heardAll = vs.every(v => S.verses[v.key]);
    const mast = Math.min(...vs.map(v => S.mastery[v.key] || 0));
    const s1 = al.audio ? heardAll : mast >= 1;
    return (s1 ? 1 : 0) + (mast >= 2 ? 1 : 0) + (mast >= 3 ? 1 : 0);
  }
  function teamimStars() {
    const heardAll = PHRASES.every(p => S.heard[p.i]);
    const best = (S.games.quiz && S.games.quiz.best) || 0;
    return (heardAll ? 1 : 0) + (best >= 7 ? 1 : 0) + (best >= 10 ? 1 : 0);
  }
  const starsEl = (n, of = 3) => h('span', { class: 'stars', 'aria-label': `${n} כוכבים` }, Array.from({ length: of }, (_, i) => h('i', { class: i < n ? 'on' : '' }, '⭐')));

  function renderHome(view) {
    const days = daysUntil(P.shabbat.date);
    const lv = levelOf(S.xp), nxt = LEVELS[lv + 1];
    const pct = nxt ? ((S.xp - LEVELS[lv][0]) / (nxt[0] - LEVELS[lv][0])) * 100 : 100;
    const q = todayQuest();

    const hero = h('section', { class: 'hero' },
      h('div', { class: 'kicker' }, 'פרשת הבר מצווה של נבו'),
      h('div', { class: 'title' }, 'שׁוֹפְטִים'),
      days > 0
        ? h('div', { class: 'countdown' }, h('span', { class: 'num' }, days), h('span', { class: 'lbl' }, days === 1 ? 'יום לשבת שופטים' : 'ימים לשבת שופטים', h('small', null, `${P.shabbat.heb} · ${fmtDate(P.shabbat.date)}`)))
        : h('div', { class: 'countdown' }, h('span', { class: 'lbl' }, days === 0 ? 'היום! מזל טוב 🎉' : 'מזל טוב, חתן בר מצווה! 🎉')),
      h('div', { class: 'level' },
        h('div', { class: 'row' }, h('span', null, `רמה ${lv + 1} · ${LEVELS[lv][1]}`), h('span', null, nxt ? `${S.xp} / ${nxt[0]}` : `${S.xp}`)),
        h('div', { class: 'bar' }, h('i', { style: `width:${Math.max(3, pct)}%` }))));

    const quest = h('div', { class: 'card quest' + (S.quest.done ? ' done' : '') },
      h('div', { class: 'qi' }, S.quest.done ? '✅' : q.i),
      h('div', { style: 'flex:1;min-width:0' },
        h('div', { class: 'qt' }, 'המשימה של היום: ' + q.t),
        h('div', { class: 'qd' }, S.quest.done ? 'בוצע! תחזור מחר למשימה חדשה' : q.d),
        h('div', { class: 'bar' }, h('i', { style: `width:${(S.quest.n / q.goal) * 100}%` }))),
      h('div', { class: 'qx' }, S.quest.done ? '' : '+50'));

    // the path
    const nodes = [{ kind: 'teamim', stars: teamimStars() }].concat(P.aliyot.map(a => ({ kind: 'aliyah', a, stars: aliyahStars(a.n) })));
    const curIdx = Math.max(0, nodes.findIndex(n => n.stars < 3));
    const offs = [0, -58, -86, -58, 0, 58, 86, 58, 0];
    const path = h('div', { class: 'path' }, nodes.map((nd, i) => {
      const isCur = i === curIdx;
      let cls = 'node', disc, label, sub, href, badgeTxt = null;
      if (nd.kind === 'teamim') {
        cls += nd.stars >= 3 ? ' gold' : ' sun';
        disc = '🎵'; label = 'הטעמים'; sub = `${PHRASES.length} צירופים · שיר הטעמים`; href = '#/teamim';
      } else {
        const a = nd.a, vs = aliyahVerses(a.n);
        cls += nd.stars >= 3 ? ' gold' : (nd.stars > 0 || isCur ? '' : ' fresh');
        disc = a.maftir ? 'מ' : heNum(a.n).replace(/[׳״]/g, '');
        label = a.name;
        sub = `${vs.length} פסוקים` + (a.audio ? ' · 🎧 מוקלט' : ' · 🎙️ בקרוב');
        href = `#/read/${a.n}`;
        if (a.audio) badgeTxt = '🎧';
      }
      if (isCur) cls += ' cur';
      return h('a', { class: cls, href, style: `transform:translateX(${offs[i % offs.length]}px)` },
        isCur ? h('span', { class: 'go' }, S.xp ? 'ממשיכים' : 'מתחילים!') : null,
        h('span', { class: 'disc' }, disc),
        badgeTxt ? h('span', { class: 'badge' }, badgeTxt) : null,
        h('span', { class: 'nl' }, label),
        starsEl(nd.stars),
        h('span', { class: 'ns' }, sub));
    }));

    view.append(hero, quest, h('h2', { class: 'h2' }, 'המסע לבר מצווה'), path,
      h('div', { class: 'credit' }, 'הקול: אבא · הטקסט: ', P.source));
    requestAnimationFrame(() => { const c = $('.node.cur'); if (c && S.xp) c.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' }); });
  }

  // ---------- te'amim ----------
  function bestAliyahFor(id) {
    const a1 = aliyahVerses(1).some(v => v.words.some(w => w.ids.includes(id)));
    if (a1) return 1;
    const al = P.aliyot.find(a => !a.maftir && aliyahVerses(a.n).some(v => v.words.some(w => w.ids.includes(id))));
    return al ? al.n : 1;
  }
  function taamChip(id) {
    const n = COUNTS[id] || 0;
    return h(n ? 'a' : 'span', { class: 'tchip', style: `--pc:var(--t-${famOf(id)})`, href: n ? `#/read/${bestAliyahFor(id)}/${id}` : null, title: n ? 'הראה לי בפרשה' : null },
      h('span', { class: 'g tm' }, carrier(id)), T[id].name, h('span', { class: 'n' }, n ? `×${n}` : 'לא בפרשה'));
  }

  function renderTeamim(view) {
    const playAll = h('button', { class: 'btn sun sm' }, '▶ כל השיר');
    const list = h('div', { class: 'phrases' });
    const cards = PHRASES.map(ph => {
      const words = h('div', { class: 'words tm' }, ph.parts.map((p, k) => [h('span', { class: 'part', style: `--pc:var(--t-${p.fam})`, 'data-k': k }, p.label), ' ']));
      const ids = [...new Set(ph.parts.map(p => p.id))];
      const btn = h('button', { class: 'play', 'aria-label': 'נגן', html: ICON.play });
      const card = h('div', { class: 'phrase', style: `--acc:var(--t-${ph.acc})` },
        h('span', { class: 'num' }, ph.i + 1), words, btn,
        h('div', { class: 'meta' }, ids.map(taamChip),
          S.heard[ph.i] ? h('span', { class: 'heard' }, '✓ שמעת') : null,
          ids.includes('shalshelet') ? h('span', { class: 'rare' }, 'מופיעה רק 4 פעמים בכל התורה, ולא בשופטים 😉') : null));
      btn.addEventListener('click', () => (card.classList.contains('playing') ? stopAll() : playPhrase(ph.i)));
      words.addEventListener('click', ev => { const p = ev.target.closest('.part'); if (p) playPhrase(ph.i, +p.dataset.k); });
      list.append(card);
      return card;
    });

    function playPhrase(i, onlyPart = null, done) {
      const ph = PHRASES[i], card = cards[i], parts = $$('.part', card), btn = $('.play', card);
      const s = onlyPart == null ? 0 : ph.parts[onlyPart].s;
      const e = onlyPart == null ? ph.dur : ph.parts[onlyPart].e;
      clip.play(ph.file, s, e, {
        tick(t) { parts.forEach((el, k) => el.classList.toggle('lit', t >= ph.parts[k].s && t < ph.parts[k].e)); },
        done(interrupted) {
          card.classList.remove('playing'); btn.innerHTML = ICON.play;
          parts.forEach(el => el.classList.remove('lit'));
          if (!interrupted && onlyPart == null) heardPhrase(i, card);
          if (done) done(interrupted);
        },
      });
      cards.forEach(c => c.classList.remove('playing'));
      card.classList.add('playing'); btn.innerHTML = ICON.pause;
    }
    function heardPhrase(i, card) {
      questEvent('teamim');
      if (S.heard[i]) return;
      S.heard[i] = true; save();
      addXP(5);
      const meta = $('.meta', card);
      if (!$('.heard', meta)) meta.append(h('span', { class: 'heard' }, '✓ שמעת'));
      if (PHRASES.every(p => S.heard[p.i])) { badge('ears'); setTimeout(() => { confetti(); addXP(30, 'כל שיר הטעמים!'); }, 400); }
    }
    playAll.addEventListener('click', () => {
      stopAll();
      const my = ++playAllToken;
      const step = i => {
        if (my !== playAllToken || i >= PHRASES.length) return;
        cards[i].scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        playPhrase(i, null, interrupted => { if (!interrupted) setTimeout(() => step(i + 1), 350); });
      };
      step(0);
    });

    view.append(
      h('div', { class: 'tm-head' }, h('div', null, h('h1', { class: 'h1' }, 'הטעמים'), h('p', { class: 'sub', style: 'margin:0' }, 'שיר הטעמים בקול של אבא')), playAll),
      h('p', { class: 'explain' }, 'לחץ על שם של טעם כדי לשמוע רק אותו, ועל התגית למטה כדי למצוא אותו בפרשה. ', h('b', null, 'הצבע מספר משהו: '), 'טעם ', h('b', null, 'מפסיק'), ' (כמו טִפְּחָא) עוצר את המנגינה, וטעם ', h('b', null, 'משרת'), ' (כמו מֵרְכָא) מוביל אליו, ולכן הוא צבוע בצבע שלו.'),
      list);
  }

  // ---------- reader ----------
  let player = null;
  function unmountPlayer() {
    if (player) { player.destroy(); player = null; }
    document.documentElement.style.setProperty('--player-h', '0px');
  }

  function renderReader(view, parts) {
    const n = Math.min(8, Math.max(1, parseInt(parts[1], 10) || S.lastAliyah || 1));
    const filter = parts[2] && T[parts[2]] ? parts[2] : null;
    S.lastAliyah = n; save(); updateReadTab();
    const al = P.aliyot[n - 1];
    const vs = aliyahVerses(n);

    const chips = h('div', { class: 'aliyot' }, P.aliyot.map(a => h('a', { class: 'al' + (a.n === n ? ' on' : ''), href: `#/read/${a.n}` + (filter ? '/' + filter : '') }, a.name, a.audio ? h('span', { class: 'mic' }, '🎧') : null)));
    const bTm = h('button', { class: S.set.view === 'tm' ? 'on' : '' }, 'עם טעמים');
    const bTo = h('button', { class: S.set.view === 'torah' ? 'on' : '' }, 'כמו בספר תורה');
    const colorsBtn = h('button', { class: 'icon-toggle' + (S.set.colors ? ' on' : ''), 'aria-label': 'צבעים לפי טעם', title: 'צבעים לפי טעם' }, '🎨');
    const tools = h('div', { class: 'reader-tools' }, chips, h('div', { class: 'view-row' }, h('div', { class: 'seg' }, bTm, bTo), colorsBtn));
    if (filter) {
      const cnt = vs.reduce((s, v) => s + v.words.filter(w => w.ids.includes(filter)).length, 0);
      tools.append(h('div', { class: 'filter-pill', style: `--pc:var(--t-${famOf(filter)})` },
        h('span', null, h('span', { class: 'g' }, carrier(filter)), ` ${T[filter].name}: ${cnt ? cnt + ' בעלייה הזאת' : 'אין בעלייה הזאת'}`),
        h('button', { 'aria-label': 'בטל סימון', onclick: () => { location.hash = `#/read/${n}`; } }, '✕')));
    }

    const text = buildText(vs, { filter });
    const first = vs[0], last = vs[vs.length - 1];
    const scroll = h('div', { class: 'scroll' + (S.set.view === 'torah' ? ' torah' : '') },
      h('div', { class: 'al-title' }, h('span', { class: 't' }, al.maftir ? 'מפטיר' : `עליית ${al.name}`), h('span', { class: 'r' }, `${heNum(first.c)} ${heNum(first.v)} עד ${heNum(last.c)} ${heNum(last.v)}`)),
      al.audio ? null : h('div', { class: 'no-audio' }, h('span', { style: 'font-size:22px' }, '🎙️'), h('span', null, 'אבא עוד לא הקליט את העלייה הזאת. בינתיים: לחץ על מילה כדי לשמוע את הטעם שלה.')),
      text);
    view.append(tools, scroll);
    requestAnimationFrame(() => { const on = $('.al.on', chips); if (on) on.scrollIntoView({ inline: 'center', block: 'nearest' }); });

    const setView = v => {
      S.set.view = v; save();
      bTm.classList.toggle('on', v === 'tm'); bTo.classList.toggle('on', v === 'torah');
      scroll.classList.toggle('torah', v === 'torah');
      closeBubble();
    };
    bTm.addEventListener('click', () => setView('tm'));
    bTo.addEventListener('click', () => setView('torah'));
    colorsBtn.addEventListener('click', () => {
      S.set.colors = !S.set.colors; save();
      colorsBtn.classList.toggle('on', S.set.colors); text.classList.toggle('colors', S.set.colors);
      if (S.set.colors) toast('🎨 כל משפחת טעמים בצבע משלה');
    });

    if (al.audio) player = mountPlayer(vs, al, text, scroll);

    text.addEventListener('click', ev => {
      const we = ev.target.closest('.w'); if (!we) return;
      const vi = +we.parentElement.dataset.vi, wi = +we.dataset.wi;
      const v = vs[vi], w = v.words[wi];
      const torah = S.set.view === 'torah';
      if (torah) {
        showBubble(scroll, we, { word: w.t, title: taamNames(w), note: w.k ? `כתוב "${w.k}" וקוראים כך` : null, ms: 3200 });
        const c = wordClip(v, wi);
        if (c) { if (player) player.pause(); clip.play(c.src, c.s, c.e); }
      } else if (player) {
        player.playFrom(vi, wi);
        showBubble(scroll, we, { title: taamNames(w), note: w.k ? `כתוב "${w.k}"` : null, ms: 1500 });
      } else {
        showBubble(scroll, we, { title: taamNames(w), note: w.k ? `כתוב "${w.k}" וקוראים כך` : 'השמעה: המנגינה של הטעם משיר הטעמים', ms: 2600 });
        if (w.pri && w.pri !== 'legarmeh') playSample(w.pri); else if (w.ids.includes('munach')) playSample('munach');
      }
    });
  }

  function mountPlayer(vs, al, textEl, scrollEl) {
    const a = new Audio();
    a.preload = 'metadata';
    a.src = al.audio;
    a.preservesPitch = true; a.webkitPreservesPitch = true;
    a.playbackRate = S.set.speed;
    const t0 = vs[0].s, t1 = vs[vs.length - 1].e;
    const verseEls = $$('.vs', textEl);
    const wordEls = verseEls.map(ve => $$('.w', ve));
    let curV = -1, curW = -1, loopV = false, raf = 0, lastT = null, stopAt = null, userScrollUntil = 0;
    const acc = vs.map(() => 0);

    const playBtn = h('button', { class: 'pbtn big', 'aria-label': 'נגן', html: ICON.play });
    const prevBtn = h('button', { class: 'pbtn', 'aria-label': 'פסוק קודם', html: ICON.toRight });
    const nextBtn = h('button', { class: 'pbtn', 'aria-label': 'פסוק הבא', html: ICON.toLeft });
    const speedBtn = h('button', { class: 'pbtn', 'aria-label': 'מהירות' });
    const loopBtn = h('button', { class: 'pbtn', 'aria-label': 'חזרה על הפסוק', title: 'חזרה על הפסוק', html: ICON.loop });
    const micBtn = h('button', { class: 'pbtn', 'aria-label': 'הקלט את עצמך', title: 'הקלט את עצמך', html: ICON.mic });
    const range = h('input', { type: 'range', min: 0, max: 1000, value: 0, 'aria-label': 'מיקום בהקלטה' });
    const recRow = h('div', { class: 'recsheet', hidden: true });
    const el = h('div', { class: 'player', id: 'player' },
      h('div', { class: 'prog' }, range),
      h('div', { class: 'row' }, speedBtn, loopBtn, prevBtn, playBtn, nextBtn, micBtn),
      recRow);
    document.body.append(el);
    const setH = () => document.documentElement.style.setProperty('--player-h', el.offsetHeight + 'px');
    setH();

    const SPEEDS = [1, 0.8, 0.6];
    const showSpeed = () => { speedBtn.textContent = S.set.speed === 1 ? '1×' : `${S.set.speed}×`; speedBtn.classList.toggle('on', S.set.speed !== 1); };
    showSpeed();

    const findVerse = t => { for (let i = 0; i < vs.length; i++) if (t >= vs[i].s && t < vs[i].e) return i; return t >= t1 ? vs.length - 1 : 0; };
    const findWord = (vi, t) => { const ws = vs[vi].ws; let k = 0; while (k + 1 < ws.length && t >= ws[k + 1]) k++; return k; };

    function paint(t, follow) {
      const vi = findVerse(t), wi = findWord(vi, t);
      if (vi !== curV) {
        if (curV >= 0) verseEls[curV].classList.remove('cur');
        verseEls[vi].classList.add('cur');
        curV = vi; curW = -1;
        if (follow && performance.now() > userScrollUntil) verseEls[vi].scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      if (wi !== curW) {
        $$('.w.now', textEl).forEach(x => x.classList.remove('now'));
        if (!a.paused) wordEls[vi][wi].classList.add('now');
        curW = wi;
      }
      range.value = Math.round(((t - t0) / (t1 - t0)) * 1000);
    }
    function markHeard(vi) {
      const v = vs[vi];
      questEvent('verse');
      if (S.verses[v.key]) return;
      S.verses[v.key] = 1; save();
      addXP(3);
      if (vs.every(x => S.verses[x.key])) {
        if (al.n === 1) badge('rishon');
        setTimeout(() => { confetti(); addXP(30, `שמעת את כל עליית ${al.name}!`); }, 500);
      }
    }
    // one update; runs on every frame, and on timeupdate too (frames stop when the page isn't drawn)
    function step() {
      const t = a.currentTime;
      if (loopV && curV >= 0 && t >= vs[curV].e - 0.04) { a.currentTime = vs[curV].s; lastT = null; return true; }
      if (stopAt != null && t >= stopAt) { stopAt = null; pause(); return false; }
      if (t >= t1 - 0.02) { pause(); a.currentTime = t0; paint(t0, false); return false; }
      if (lastT != null && curV >= 0) {
        const dt = t - lastT;
        if (dt > 0 && dt < 1.2) {
          acc[curV] += dt;
          if (acc[curV] > 0.7 * (vs[curV].e - vs[curV].s) && !acc['h' + curV]) { acc['h' + curV] = 1; markHeard(curV); }
        }
      }
      lastT = t;
      paint(t, true);
      return true;
    }
    function tick() { if (!a.paused && step()) raf = requestAnimationFrame(tick); }
    a.addEventListener('timeupdate', () => { if (!a.paused) step(); });
    function play() {
      clip.stop();
      const p = seekAndPlay(a, Math.max(a.currentTime, 0) < t0 ? t0 : a.currentTime);
      playBtn.innerHTML = ICON.pause; playBtn.setAttribute('aria-label', 'השהה');
      lastT = null;
      cancelAnimationFrame(raf);
      const go = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); };
      if (p && p.then) p.then(go).catch(() => pause()); else go();
    }
    function pause() {
      a.pause();
      cancelAnimationFrame(raf);
      playBtn.innerHTML = ICON.play; playBtn.setAttribute('aria-label', 'נגן');
      $$('.w.now', textEl).forEach(x => x.classList.remove('now'));
      curW = -1;
    }
    function seek(t, andPlay = true) {
      t = Math.max(t0, Math.min(t1 - 0.05, t));
      if (a.readyState >= 1) a.currentTime = t;
      lastT = null;
      if (andPlay) { if (a.readyState >= 1) play(); else { a.currentTime = 0; seekAndPlay(a, t).then(() => { playBtn.innerHTML = ICON.pause; cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }).catch(() => {}); } }
      else paint(t, false);
    }
    stopReader = () => { if (!a.paused) pause(); };

    playBtn.addEventListener('click', () => (a.paused ? play() : pause()));
    prevBtn.addEventListener('click', () => {
      const cv = curV < 0 ? 0 : curV;
      const t = a.currentTime;
      seek(t - vs[cv].s > 1.5 ? vs[cv].s : vs[Math.max(0, cv - 1)].s, !a.paused || true);
    });
    nextBtn.addEventListener('click', () => { const cv = curV < 0 ? 0 : curV; if (cv + 1 < vs.length) seek(vs[cv + 1].s); });
    speedBtn.addEventListener('click', () => {
      S.set.speed = SPEEDS[(SPEEDS.indexOf(S.set.speed) + 1) % SPEEDS.length] || 1; save();
      a.playbackRate = S.set.speed; showSpeed();
      if (S.set.speed < 1) { badge('turtle'); toast(S.set.speed === 0.8 ? '🐢 קצת יותר לאט' : '🐢🐢 לאט לאט'); } else toast('🐇 מהירות רגילה');
    });
    loopBtn.addEventListener('click', () => {
      loopV = !loopV; loopBtn.classList.toggle('on', loopV);
      toast(loopV ? '🔁 הפסוק יחזור שוב ושוב' : 'חזרה על פסוק: כבוי');
    });
    range.addEventListener('input', () => { seek(t0 + (range.value / 1000) * (t1 - t0), false); });
    range.addEventListener('change', () => { if (!a.paused) play(); });
    const onUserScroll = () => { userScrollUntil = performance.now() + 3500; };
    window.addEventListener('touchmove', onUserScroll, { passive: true });
    window.addEventListener('wheel', onUserScroll, { passive: true });

    // record yourself, then compare with Abba
    let rec = null, recUrl = null, recVi = 0;
    const meAudio = new Audio();
    function showRecRow() {
      recRow.hidden = false; recRow.innerHTML = '';
      const v = vs[recVi];
      recRow.append(
        h('span', { class: 'small', style: 'opacity:.85;font-weight:700' }, `פסוק ${heNum(v.v)}:`),
        h('button', { class: 'btn sun sm', onclick: () => { pause(); clip.stop(); meAudio.src = recUrl; meAudio.play(); } }, '▶ אני'),
        h('button', { class: 'btn sm', onclick: () => { meAudio.pause(); stopAt = v.e; seek(v.s); } }, '▶ אבא'),
        h('button', { class: 'btn ghost sm', 'aria-label': 'סגור', onclick: () => { recRow.hidden = true; setH(); } }, '✕'));
      setH();
    }
    micBtn.addEventListener('click', async () => {
      if (rec && rec.state === 'recording') { rec.stop(); return; }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) { toast('הדפדפן הזה לא יודע להקליט'); return; }
      let stream;
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { toast('צריך לאשר גישה למיקרופון 🎤'); return; }
      pause();
      recVi = curV >= 0 ? curV : 0;
      const chunks = [];
      rec = new MediaRecorder(stream);
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach(tr => tr.stop());
        micBtn.classList.remove('rec'); micBtn.innerHTML = ICON.mic;
        if (recUrl) URL.revokeObjectURL(recUrl);
        recUrl = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
        const key = vs[recVi].key;
        if (!S.recs[key]) { S.recs[key] = 1; save(); addXP(10, 'הקלטה'); }
        badge('mic');
        showRecRow();
      };
      rec.start();
      micBtn.classList.add('rec'); micBtn.innerHTML = ICON.stop;
      toast(`🎤 מקליט את פסוק ${heNum(vs[recVi].v)}. לחץ שוב כדי לסיים`);
    });

    a.addEventListener('ended', () => pause());
    paint(t0, false);
    verseEls[0].classList.remove('cur'); curV = -1;

    return {
      playFrom(vi, wi) { stopAt = null; seek(vs[vi].ws ? vs[vi].ws[wi] : vs[vi].s); },
      pause,
      destroy() {
        pause(); a.src = ''; meAudio.pause();
        if (rec && rec.state === 'recording') rec.stop();
        window.removeEventListener('touchmove', onUserScroll);
        window.removeEventListener('wheel', onUserScroll);
        el.remove(); stopReader = () => {};
      },
    };
  }

  // ---------- games hub ----------
  function renderGames(view) {
    const g = S.games;
    const card = (id, cls, icon, title, desc, best) => h('a', { class: 'game-card ' + cls, href: `#/game/${id}` },
      h('span', { class: 'gi' }, icon), h('span', null, h('div', { class: 'gt' }, title), h('div', { class: 'gd' }, desc)), best ? h('span', { class: 'gb' }, best) : null);
    const sfxBtn = h('button', { class: 'btn ghost sm' }, S.set.sfx ? '🔊 צלילים: פועלים' : '🔇 צלילים: כבויים');
    sfxBtn.addEventListener('click', () => { S.set.sfx = !S.set.sfx; save(); sfxBtn.textContent = S.set.sfx ? '🔊 צלילים: פועלים' : '🔇 צלילים: כבויים'; if (S.set.sfx) sfx.ok(); });
    const mastered = VERSES.filter(v => (S.mastery[v.key] || 0) >= 3).length;
    view.append(
      h('h1', { class: 'h1' }, 'משחקים'),
      h('p', { class: 'sub' }, 'כל משחק נותן נקודות, והנקודות מעלות אותך ברמות.'),
      h('div', { class: 'games' },
        card('quiz', 'g1', '🎯', 'מה הטעם?', 'סימנים, שמות ומילים מהפרשה', g.quiz ? `שיא: ${g.quiz.best}/10` : null),
        card('hunt', 'g2', '🔍', 'צייד טעמים', 'מצא בפסוק את כל הטעמים מאותו סוג', g.hunt ? `נמצאו: ${g.hunt.total}` : null),
        card('memory', 'g3', '🃏', 'זיכרון', 'זוגות של סימן ושם', g.memory ? `שיא: ${g.memory.best} מהלכים` : null),
        card('torah', 'g4', '📜', 'אתגר ספר תורה', 'קרא בלי ניקוד ובלי טעמים, כמו בבר מצווה', mastered ? `😎 ${mastered} פסוקים` : null)),
      h('h2', { class: 'h2' }, 'התגים שלי'),
      h('div', { class: 'badges' }, BADGES.map(b => h('div', { class: 'bdg' + (S.badges[b.id] ? '' : ' off') }, h('div', { class: 'bi' }, b.i), h('div', { class: 'bn' }, b.n), h('div', { class: 'bd' }, b.d)))),
      h('div', { style: 'margin-top:22px;text-align:center' }, sfxBtn));
  }

  function renderGame(view, parts) {
    document.body.classList.add('game-mode');
    const id = parts[1];
    ({ quiz: gameQuiz, hunt: gameHunt, memory: gameMemory, torah: gameTorah }[id] || (() => { location.hash = '#/games'; }))(view, parts);
  }
  function gameTop(view, { onClose } = {}) {
    const bar = h('i'), hud = h('span', { class: 'hud' });
    const top = h('div', { class: 'gtop' }, h('button', { class: 'x', 'aria-label': 'יציאה', onclick: () => { if (onClose) onClose(); location.hash = '#/games'; } }, '✕'), h('div', { class: 'bar' }, bar), hud);
    view.append(top);
    return { setProgress: p => { bar.style.width = Math.max(0, Math.min(100, p * 100)) + '%'; }, hud };
  }
  function feedbackSheet(good, title, sub, onNext, label = 'המשך') {
    const fb = h('div', { class: 'feedback ' + (good ? 'good' : 'bad') },
      h('span', null, title, sub ? h('span', { class: 'fb-sub' }, sub) : null),
      h('button', { class: 'btn ' + (good ? 'mint' : 'coral'), onclick: () => { fb.remove(); onNext(); } }, label));
    document.body.append(fb);
    return fb;
  }
  function resultScreen(view, { icon, title, score, stars, lines = [], again, xp }) {
    view.innerHTML = '';
    view.append(h('div', { class: 'result' },
      h('div', { class: 'big' }, icon), h('div', { class: 'h1' }, title),
      score != null ? h('div', { class: 'score' }, score) : null,
      stars != null ? starsEl(stars) : null,
      lines.map(l => h('p', { class: 'muted', style: 'margin:4px 0' }, l)),
      h('div', { class: 'actions' }, h('button', { class: 'btn block', onclick: again }, 'עוד סיבוב'), h('a', { class: 'btn ghost block', href: '#/games' }, 'למשחקים אחרים'))));
    if (stars >= 2) confetti();
    if (xp) setTimeout(() => addXP(xp), 400);
  }

  // ---------- game: what's the ta'am? ----------
  const LOOKALIKE = [
    ['pashta', 'kadma', 'geresh', 'gershayim', 'telishaK'],
    ['munach', 'mahpach', 'mercha', 'yetiv', 'darga', 'tevir', 'tipcha'],
    ['katon', 'gadol', 'revii', 'segol', 'shalshelet'],
    ['telishaK', 'telishaG', 'pazer', 'zarka'],
    ['etnachta', 'sofpasuk', 'tipcha', 'mercha', 'munach'],
  ];
  function distractors(ans, n = 3, exclude = []) {
    const no = new Set([ans, ...exclude]);
    const similar = shuffle([...new Set(LOOKALIKE.filter(g => g.includes(ans)).flat())]).filter(x => !no.has(x) && QUIZ_IDS.includes(x));
    const out = similar.slice(0, 2);
    for (const x of shuffle(QUIZ_IDS)) { if (out.length >= n) break; if (!no.has(x) && !out.includes(x)) out.push(x); }
    return out;
  }
  function makeQuestion(type) {
    if (type === 'sym') {
      const ans = pick(QUIZ_IDS);
      return { type, ans, prompt: 'איזה טעם זה?', big: carrier(ans), opts: shuffle([ans, ...distractors(ans)]), optKind: 'name' };
    }
    if (type === 'name') {
      const ans = pick(QUIZ_IDS);
      return { type, ans, prompt: `איפה ה${T[ans].name}?`, opts: shuffle([ans, ...distractors(ans)]), optKind: 'sym' };
    }
    if (type === 'seq') {
      const ph = pick(PHRASES.filter(p => p.parts.length >= 2));
      const k = Math.random() < 0.6 ? ph.parts.length - 1 : Math.floor(Math.random() * ph.parts.length);
      const ans = ph.parts[k].id;
      const valid = PHRASES.filter(q => q.parts.length === ph.parts.length && q.parts.every((p, j) => j === k || p.id === ph.parts[j].id)).map(q => q.parts[k].id);
      return { type, ans, ph, k, prompt: 'מה חסר בשיר הטעמים?', opts: shuffle([ans, ...distractors(ans, 3, valid)]), optKind: 'name' };
    }
    // a real word from the parasha with exactly one ta'am
    const pool = [];
    VERSES.forEach(v => v.words.forEach((w, wi) => { if (w.ids.length === 1 && !T[w.ids[0]].hidden && w.st.length > 1) pool.push({ v, wi, w }); }));
    const fromRishon = pool.filter(x => x.v.ws);
    const it = Math.random() < 0.6 && fromRishon.length ? pick(fromRishon) : pick(pool);
    const ans = it.w.ids[0];
    return { type: 'word', ans, it, prompt: 'איזה טעם יש על המילה?', big: it.w.t, opts: shuffle([ans, ...distractors(ans)]), optKind: 'name' };
  }

  function gameQuiz(view) {
    const ROUNDS = 10;
    const types = shuffle(['sym', 'sym', 'sym', 'name', 'name', 'seq', 'seq', 'word', 'word', 'word']);
    let i = 0, score = 0, streak = 0, bestStreak = 0, xp = 0;
    const top = gameTop(view, { onClose: () => clip.stop() });
    const stage = h('div');
    view.append(stage);

    function show() {
      top.setProgress(i / ROUNDS);
      top.hud.innerHTML = '';
      top.hud.append(streak >= 2 ? h('span', { class: 'combo' }, `🔥×${streak} `) : '', `${score}/${ROUNDS}`);
      const q = makeQuestion(types[i]);
      stage.innerHTML = '';
      stage.append(h('div', { class: 'q-prompt' }, q.prompt));
      if (q.type === 'seq') {
        stage.append(h('div', { class: 'q-big seq tm' }, q.ph.parts.map((p, j) => j === q.k ? h('span', { class: 'blank' }, '?') : [h('span', { style: `color:var(--t-${p.fam})` }, p.label), ' '])));
      } else if (q.type === 'name') {
        stage.append(h('div', { class: 'q-big', style: 'font-family:var(--font-ui);font-size:40px;font-weight:900;padding:18px 10px' }, T[q.ans].name));
      } else {
        stage.append(h('div', { class: 'q-big tm' + (q.type === 'word' ? ' word' : '') }, q.big));
      }
      const opts = h('div', { class: 'opts' });
      q.opts.forEach(id => {
        const b = h('button', { class: 'opt' }, q.optKind === 'sym' ? h('span', { class: 'tm' }, carrier(id)) : T[id].name);
        b.addEventListener('click', () => answer(q, id, b, opts));
        opts.append(b);
      });
      stage.append(opts);
    }
    function answer(q, id, b, opts) {
      $$('.opt', opts).forEach(x => { x.disabled = true; });
      const good = id === q.ans;
      const rightBtn = $$('.opt', opts)[q.opts.indexOf(q.ans)];
      rightBtn.classList.add('right');
      if (good) {
        score++; streak++; bestStreak = Math.max(bestStreak, streak);
        const mult = 1 + Math.min(2, Math.floor(streak / 3));
        xp += 10 * mult;
        sfx.ok();
        const r = b.getBoundingClientRect();
        confetti(streak >= 3 ? 60 : 32, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
        if (streak >= 5) badge('sniper');
      } else { b.classList.add('wrong'); streak = 0; sfx.bad(); }
      // hear it: the word as Abba read it, or the ta'am from the song
      // (started inside the tap itself: iPhones block audio started later from a timer)
      (() => {
        if (q.type === 'word') { const c = wordClip(q.it.v, q.it.wi); if (c) { clip.play(c.src, c.s, c.e); return; } }
        if (q.type === 'seq') { clip.play(q.ph.file, 0, q.ph.dur); return; }
        playSample(q.ans);
      })();
      const title = good ? pick(['יפה!', 'מעולה!', 'בול!', 'אלוף!', 'נכון!']) : 'כמעט...';
      const sub = good ? (streak >= 3 ? `רצף של ${streak} 🔥` : '') : `התשובה: ${T[q.ans].name}`;
      feedbackSheet(good, title, sub, () => {
        clip.stop();
        i++;
        if (i < ROUNDS) show(); else finish();
      });
    }
    function finish() {
      const g = S.games.quiz || { best: 0, plays: 0 };
      g.best = Math.max(g.best, score); g.plays++; S.games.quiz = g; save();
      if (score === ROUNDS) badge('perfect');
      questEvent('quiz');
      const stars = score >= 10 ? 3 : score >= 8 ? 2 : score >= 5 ? 1 : 0;
      resultScreen(view, {
        icon: score >= 8 ? '🏆' : score >= 5 ? '👏' : '💪', title: score >= 8 ? 'וואו!' : score >= 5 ? 'יפה מאוד!' : 'עוד סיבוב ותשבור את זה',
        score: `${score}/${ROUNDS}`, stars, lines: [bestStreak >= 3 ? `הרצף הכי ארוך: ${bestStreak} 🔥` : ''],
        again: () => route(), xp: xp + (score === ROUNDS ? 30 : 0),
      });
    }
    show();
  }

  // ---------- game: ta'am hunter ----------
  function gameHunt(view) {
    const ROUNDS = 5;
    let round = 0, hearts = 3, found = 0;
    const top = gameTop(view);
    const stage = h('div', { class: 'hunt' });
    view.append(stage);
    const usable = VERSES.filter(v => v.words.length <= 18);

    function show() {
      top.setProgress(round / ROUNDS);
      top.hud.innerHTML = ''; top.hud.append(h('span', { class: 'hearts' }, '❤️'.repeat(hearts) + '🤍'.repeat(3 - hearts)));
      // a verse and a ta'am that appears in it (prefer one that appears more than once)
      let v, target, tries = 0;
      do {
        v = pick(usable);
        const counts = {};
        v.words.forEach(w => w.ids.forEach(id => { if (id !== 'sofpasuk' && !T[id].hidden) counts[id] = (counts[id] || 0) + 1; }));
        const ids = Object.keys(counts);
        const multi = ids.filter(id => counts[id] > 1);
        target = multi.length && Math.random() < 0.7 ? pick(multi) : pick(ids);
      } while (!target && ++tries < 20);
      const need = v.words.map((w, wi) => (w.ids.includes(target) ? wi : -1)).filter(x => x >= 0);
      let left = need.length;
      const leftEl = h('span', { class: 'left' });
      const setLeft = () => { leftEl.textContent = left ? `נשארו ${left}` : 'מצאת הכול!'; };
      setLeft();
      stage.innerHTML = '';
      stage.append(
        h('div', { class: 'q-prompt' }, 'מצא את כל המילים עם'),
        h('div', { class: 'hunt-target', style: `--pc:var(--t-${famOf(target)})` }, h('span', { class: 'g' }, carrier(target)), h('span', null, T[target].name, h('br'), leftEl)));
      const scroll = h('div', { class: 'scroll' }, h('div', { class: 'al-title' }, h('span', { class: 'r' }, `${heNum(v.c)} ${heNum(v.v)}`)));
      const text = buildText([v]);
      text.classList.remove('colors');
      scroll.append(text);
      stage.append(scroll, h('p', { class: 'muted small', style: 'text-align:center;margin-top:12px' }, 'לא בטוח איך הוא נראה? לחץ על הסימן למעלה כדי לשמוע אותו.'));
      $('.hunt-target', stage).addEventListener('click', () => playSample(target));
      text.addEventListener('click', ev => {
        const we = ev.target.closest('.w'); if (!we || we.classList.contains('found')) return;
        const wi = +we.dataset.wi;
        if (need.includes(wi)) {
          we.classList.add('found'); left--; found++; setLeft(); sfx.ok();
          if (!left) {
            round++;
            setTimeout(() => (round < ROUNDS ? show() : finish(true)), 700);
          }
        } else {
          we.classList.remove('miss'); void we.offsetWidth; we.classList.add('miss');
          hearts--; sfx.bad();
          top.hud.innerHTML = ''; top.hud.append(h('span', { class: 'hearts' }, '❤️'.repeat(Math.max(0, hearts)) + '🤍'.repeat(3 - Math.max(0, hearts))));
          showBubble(scroll, we, { title: taamNames(v.words[wi]), ms: 1600 });
          if (hearts <= 0) setTimeout(() => finish(false), 900);
        }
      });
    }
    function finish(won) {
      const g = S.games.hunt || { total: 0, best: 0 };
      g.total += found; g.best = Math.max(g.best, found); S.games.hunt = g; save();
      if (g.total >= 25) badge('hunter');
      if (won) questEvent('hunt');
      resultScreen(view, {
        icon: won ? '🕵️' : '💔', title: won ? 'צייד אמיתי!' : 'נגמרו הלבבות',
        score: `${found} טעמים`, stars: won ? (hearts === 3 ? 3 : hearts === 2 ? 2 : 1) : 0,
        lines: [won ? `סיימת ${ROUNDS} פסוקים` : `הגעת עד פסוק ${round + 1}`],
        again: () => route(), xp: found * 5 + (won ? 20 : 0),
      });
    }
    show();
  }

  // ---------- game: memory ----------
  function gameMemory(view) {
    const PAIRS = 6;
    const ids = shuffle(QUIZ_IDS.filter(id => id !== 'shalshelet')).slice(0, PAIRS);
    const deck = shuffle(ids.flatMap(id => [{ id, kind: 'sym' }, { id, kind: 'name' }]));
    let open = [], moves = 0, done = 0, lock = false;
    const top = gameTop(view);
    const setHud = () => { top.hud.textContent = `${moves} מהלכים`; top.setProgress(done / PAIRS); };
    setHud();
    const grid = h('div', { class: 'mem' });
    view.append(h('div', { class: 'q-prompt' }, 'מצא זוגות: סימן + השם שלו'), grid);
    deck.forEach(c => {
      const el = h('button', { class: 'mcard', 'aria-label': 'קלף' },
        h('div', { class: 'in' }, h('div', { class: 'f' }, '🎵'), h('div', { class: 'b' }, c.kind === 'sym' ? h('span', { class: 'tm' }, carrier(c.id)) : T[c.id].name)));
      el.addEventListener('click', () => {
        if (lock || el.classList.contains('open') || el.classList.contains('done')) return;
        el.classList.add('open'); sfx.flip();
        open.push({ el, c });
        if (open.length < 2) return;
        moves++; setHud();
        const [x, y] = open; open = [];
        if (x.c.id === y.c.id) {
          playSample(x.c.id);
          setTimeout(() => {
            x.el.classList.add('done'); y.el.classList.add('done'); x.el.classList.remove('open'); y.el.classList.remove('open');
            done++; setHud(); sfx.ok();
            if (done === PAIRS) setTimeout(finish, 900);
          }, 300);
        } else {
          lock = true;
          setTimeout(() => { x.el.classList.remove('open'); y.el.classList.remove('open'); lock = false; }, 900);
        }
      });
      grid.append(el);
    });
    function finish() {
      const g = S.games.memory || { best: 99, wins: 0 };
      g.best = Math.min(g.best, moves); g.wins++; S.games.memory = g; save();
      if (moves <= 14) badge('elephant');
      questEvent('memory');
      resultScreen(view, {
        icon: '🧠', title: 'כל הזוגות!', score: `${moves} מהלכים`, stars: moves <= 10 ? 3 : moves <= 14 ? 2 : 1,
        lines: [`השיא שלך: ${g.best} מהלכים`], again: () => route(), xp: 40 + (moves <= 14 ? 10 : 0),
      });
    }
  }

  // ---------- game: read from the Sefer Torah ----------
  function gameTorah(view, parts) {
    const n = parseInt(parts[2], 10);
    if (!n) {
      gameTop(view);
      view.append(h('h1', { class: 'h1' }, 'אתגר ספר תורה'),
        h('p', { class: 'sub' }, 'בבר מצווה קוראים מספר התורה: בלי ניקוד ובלי טעמים. קרא בקול את הפסוק, לחץ על מילה כשנתקעים, ובסוף בדוק את עצמך.'),
        h('div', { class: 'picker' }, P.aliyot.map(a => {
          const vs = aliyahVerses(a.n), m = vs.filter(v => (S.mastery[v.key] || 0) >= 3).length;
          return h('a', { class: 'btn ghost block', href: `#/game/torah/${a.n}` }, h('span', null, a.maftir ? 'מפטיר' : `עליית ${a.name}`, a.audio ? ' 🎧' : ''), h('span', { class: 'muted small' }, `😎 ${m}/${vs.length}`));
        })));
      return;
    }
    const al = P.aliyot[n - 1], vs = aliyahVerses(n);
    let i = Math.max(0, vs.findIndex(v => (S.mastery[v.key] || 0) < 3));
    let peeks = 0, gained = 0, ratedNow = 0;
    const top = gameTop(view, { onClose: () => clip.stop() });
    const stage = h('div', { class: 'tc-verse' });
    view.append(stage);

    function show() {
      clip.stop(); closeBubble();
      peeks = 0;
      const v = vs[i];
      top.setProgress(i / vs.length);
      top.hud.textContent = `${i + 1}/${vs.length}`;
      const scroll = h('div', { class: 'scroll torah' }, h('div', { class: 'al-title' }, h('span', { class: 't' }, al.maftir ? 'מפטיר' : `עליית ${al.name}`), h('span', { class: 'r' }, `פסוק ${heNum(v.v)}`)), buildText([v]));
      const check = h('button', { class: 'btn mint block' }, '✔ בדוק אותי');
      const peekNote = h('p', { class: 'muted small', style: 'text-align:center;margin:10px 0 0' }, '👀 נתקעת? לחץ על מילה כדי להציץ בה');
      stage.innerHTML = '';
      stage.append(h('div', { class: 'q-prompt' }, 'קרא בקול את הפסוק'), scroll, peekNote, h('div', { style: 'margin-top:14px' }, check));
      $('.text', scroll).addEventListener('click', ev => {
        const we = ev.target.closest('.w'); if (!we) return;
        const w = v.words[+we.dataset.wi];
        peeks++;
        peekNote.textContent = `👀 הצצת ${peeks} ${peeks === 1 ? 'פעם' : 'פעמים'}`;
        showBubble(scroll, we, { word: w.t, title: taamNames(w), note: w.k ? `כתוב "${w.k}" וקוראים כך` : null, ms: 2600 });
      });
      check.addEventListener('click', () => reveal(v, check));
    }
    function reveal(v, check) {
      check.remove(); closeBubble();
      const tmScroll = h('div', { class: 'scroll tc-reveal' }, h('div', { class: 'al-title' }, h('span', { class: 't' }, 'ככה קוראים'), al.audio ? h('span', { class: 'r' }, '🎧 אבא קורא') : null), buildText([v]));
      stage.append(tmScroll);
      if (al.audio && v.s != null) {
        const words = $$('.w', tmScroll);
        clip.play(al.audio, v.s, v.e, {
          tick: t => { let k = 0; while (k + 1 < v.ws.length && t >= v.ws[k + 1]) k++; words.forEach((el, j) => el.classList.toggle('now', j === k)); },
          done: () => words.forEach(el => el.classList.remove('now')),
        });
      }
      const rate = h('div', { class: 'rate' },
        h('button', { class: 'btn mint', onclick: () => rated(v, 3) }, h('span', null, '😎'), 'הצלחתי'),
        h('button', { class: 'btn sun', onclick: () => rated(v, 2) }, h('span', null, '🙂'), 'כמעט'),
        h('button', { class: 'btn ghost', onclick: () => rated(v, 1) }, h('span', null, '😅'), 'עוד לא'));
      stage.append(h('div', { class: 'q-prompt', style: 'margin-top:18px' }, 'איך היה?'), rate);
      requestAnimationFrame(() => rate.scrollIntoView({ block: 'end', behavior: reduceMotion ? 'auto' : 'smooth' }));
    }
    function rated(v, r) {
      clip.stop();
      closeBubble();
      S.mastery[v.key] = Math.max(S.mastery[v.key] || 0, r); save();
      const pts = Math.max(1, (r === 3 ? 15 : r === 2 ? 8 : 3) - peeks * 2);
      gained += pts; ratedNow++;
      if (r === 3) sfx.ok();
      questEvent('torah');
      i++;
      if (i < vs.length) show(); else finish();
    }
    function finish() {
      const good = vs.filter(v => (S.mastery[v.key] || 0) >= 3).length;
      if (vs.every(v => (S.mastery[v.key] || 0) >= 2)) badge('torah');
      resultScreen(view, {
        icon: good === vs.length ? '👑' : '📜', title: good === vs.length ? 'קורא מהספר!' : 'סיימת את העלייה',
        score: `😎 ${good}/${vs.length}`, stars: aliyahStars(n), lines: [`קראת ${ratedNow} פסוקים`],
        again: () => { location.hash = `#/game/torah/${n}`; route(); }, xp: gained,
      });
    }
    show();
  }

  // ---------- boot ----------
  renderStats(false);
  window.addEventListener('hashchange', route);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); });
  route();
})();
