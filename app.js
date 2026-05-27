'use strict';

/* ═══════════════════════════════════════════════
   1. 상수 / 설정
═══════════════════════════════════════════════ */
const SPREADSHEET_ID = '1GlDOaRDkmNnyF-u3RKigjlhB1OsMeQ2GHks9dQ5u6pc';
const CACHE_VERSION  = 'v1';
const DEPARTURE_DATE = '2026-07-11';
const HOLD_MS        = 800; // PRESS ON 꾹 누르기 시간

const SHEETS = {
  scripture:  '💍 약속의 말씀',
  overview:   '🌍 선교개요',
  schedule:   '📅 전체일정',
  attendance: '✅ 출석체크',
  org:        '🤝 조직도 ㅣ 💼 JOB ㅣ 👫 생활조',
  plan:       '📝 팀별사역계획',
  notice:     '🎤 공지',
};

const CONFIG = {
  prayer:    { enabled: false },
  luggage:   { enabled: false },
  notice:    { enabled: false },
  checklist: { enabled: false },
};

const TEAM_META = {
  '인터씨드팀':   { icon: '🙏', color: 'var(--purple)', bg: 'var(--purple-bg)' },
  '하스피팀':     { icon: '🤝', color: 'var(--blue)',   bg: 'var(--blue-bg)' },
  '어린이사역팀': { icon: '🌈', color: 'var(--yellow)', bg: 'var(--yellow-bg)' },
  '문화사역팀':   { icon: '🎭', color: 'var(--green)',  bg: 'var(--green-bg)' },
  '빅아이디어팀': { icon: '💡', color: 'var(--red)',    bg: 'var(--red-bg)' },
  '예배팀':       { icon: '🎵', color: '#FF6B9D',       bg: '#FFF0F7' },
};

const JOB_ICON = {
  '팀빌딩': { icon: '🏗️', bg: 'var(--blue-bg)' },
  '디자인&데코': { icon: '🎨', bg: '#FFF0F7' },
  '촬영':   { icon: '📷', bg: 'var(--green-bg)' },
  '웍듀티': { icon: '🍽️', bg: 'var(--yellow-bg)' },
  '의료지원': { icon: '🏥', bg: 'var(--red-bg)' },
  '라스트키퍼': { icon: '🔑', bg: 'var(--purple-bg)' },
  '타임키퍼': { icon: '⏰', bg: 'var(--bg)' },
};

/* ═══════════════════════════════════════════════
   2. 유틸리티
═══════════════════════════════════════════════ */
function kstNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
}

function kstDday(dateStr) {
  const now = kstNow(); now.setHours(0,0,0,0);
  const t = new Date(dateStr); t.setHours(0,0,0,0);
  return Math.ceil((t - now) / 86400000);
}

function fmtDate(dateStr) {
  const d = new Date(dateStr);
  const WD = ['일','월','화','수','목','금','토'];
  const MO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  return {
    mo: MO[d.getMonth()],
    day: d.getDate(),
    wd: WD[d.getDay()],
    full: `${d.getMonth()+1}/${d.getDate()} (${WD[d.getDay()]})`
  };
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function safeVal(row, idx) {
  return row?.c?.[idx]?.v ?? '';
}

function safeStr(row, idx) {
  return String(safeVal(row, idx)).trim();
}

/* ═══════════════════════════════════════════════
   3. Fetch / Cache
═══════════════════════════════════════════════ */
function cacheKey(sheetName) {
  return `nepal_${CACHE_VERSION}_${sheetName}`;
}

function saveCache(sheetName, data) {
  try {
    localStorage.setItem(cacheKey(sheetName), JSON.stringify({ ts: Date.now(), data }));
  } catch(e) {}
}

function loadCache(sheetName) {
  try {
    const raw = localStorage.getItem(cacheKey(sheetName));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e) { return null; }
}

function clearCache(sheetName) {
  try { localStorage.removeItem(cacheKey(sheetName)); } catch(e) {}
}

async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
  if (!match) throw new Error('파싱 실패');
  return JSON.parse(match[1]);
}

async function fetchSheetSafe(sheetName) {
  try {
    const json = await fetchSheet(sheetName);
    saveCache(sheetName, json);
    return { ok: true, data: json, offline: false };
  } catch(e) {
    const cached = loadCache(sheetName);
    if (cached) return { ok: true, data: cached.data, offline: true };
    return { ok: false, data: null, offline: false };
  }
}

/* ═══════════════════════════════════════════════
   4. 파서
═══════════════════════════════════════════════ */
function parseScripture(json) {
  try {
    const rows = json?.table?.rows ?? [];
    for (const row of rows) {
      const v = safeStr(row, 1);
      if (v && v.includes('빌')) {
        // "말씀/슬로건" 행 파싱
        const match = v.match(/^(.+?)\((.+?)\)/);
        if (match) return { text: match[1].trim(), ref: match[2].trim() };
        return { text: v, ref: '빌립보서 3:14' };
      }
    }
  } catch(e) {}
  return {
    text: '푯대를 향하여 그리스도 예수 안에서 하나님이 위에서 부르신 부름의 상을 위하여 달려가노라',
    ref: '빌립보서 3:14'
  };
}

function parseOverview(json) {
  try {
    const rows = json?.table?.rows ?? [];
    const result = {};
    for (const row of rows) {
      const key = safeStr(row, 1);
      const val = safeStr(row, 2);
      if (!key || !val) continue;
      if (key.includes('슬로건') || key.includes('주제')) result.slogan = val;
      else if (key.includes('약속')) result.scripture = val;
      else if (key.includes('일시')) result.period = val;
      else if (key.includes('장소')) result.place = val;
      else if (key.includes('대상')) result.members = val;
    }
    return result;
  } catch(e) { return {}; }
}

function parseSchedule(json) {
  // 시트 파싱 대신 확정된 한국 일정 하드코딩
  // (gviz API 캘린더 구조가 복잡해 파싱 불안정 → 하드코딩으로 안정화)
  const items = [
    { date:'2026-05-30', title:'팀모임 1회', detail:'웰컴 · 기대 나누기', type:'team' },
    { date:'2026-05-31', title:'선교학교 1 / 팀모임 2', detail:'여름단기선교의 중요성', type:'school' },
    { date:'2026-06-06', title:'팀모임 3회', detail:'', type:'team' },
    { date:'2026-06-07', title:'선교학교 2 / 팀모임 4', detail:'단기선교 준비', type:'school' },
    { date:'2026-06-13', title:'팀모임 5회', detail:'', type:'team' },
    { date:'2026-06-14', title:'선교학교 3 / 팀모임 6', detail:'JOB', type:'school' },
    { date:'2026-06-20', title:'팀모임 7회', detail:'', type:'team' },
    { date:'2026-06-21', title:'선교학교 4 / 팀모임 8', detail:'영적인 일', type:'school' },
    { date:'2026-06-27', title:'팀모임 9회', detail:'', type:'team' },
    { date:'2026-06-28', title:'선교학교 5 / 팀모임 10', detail:'하나 됨 · 파송예배', type:'school' },
    { date:'2026-06-28', title:'파송예배', detail:'', type:'special' },
    { date:'2026-07-04', title:'팀모임 11회', detail:'최종 리허설 · 짐 패킹', type:'team' },
    { date:'2026-07-05', title:'팀모임 12회', detail:'짐 패킹 2', type:'team' },
  ];

  const afterItems = [
    { date:'2026-08-02', title:'전체 에프터', detail:'', type:'after' },
    { date:'2026-08-16', title:'보고예배 · 사진전', detail:'', type:'after' },
  ];

  return { items, afterItems };
}

function parseOrg(json) {
  try {
    const rows = json?.table?.rows ?? [];

    // ── 조직도 하드코딩 ──────────────────────────
    const org = {
      director:    '박지명(90)',
      subdirector: '정예림(99)',
      accountant:  '신성민(01)',
      secretary:   '노해인(03)',
      leaderM:     '조민희(91)',
      leaderF:     '고경혜(91)',

      teams: [
        { name:'인터씨드팀',   leader:'정예림(99)', members:['조민희(91)','유지훈(99)','노해인(03)'] },
        { name:'하스피팀',     leader:'조희래(95)', members:['정지윤(95)','양한솔(91)','김준희(99)'] },
        { name:'어린이사역팀', leader:'김주찬(94)', members:['신성민(01)','박예진(95)','박희원(02)','양예원(03)', '김윤하(07)'] },
        { name:'문화사역팀',   leader:'양은정(94)', members:['조상운(92)','송무늬(98)','이시훈(96)','김유찬(99)'] },
        { name:'빅아이디어팀', leader:'이호준(93)', members:['김수빈(06)','김향(99)'] },
        { name:'예배팀',       leader:'홍예찬(96)', members:['박조한(07)','고경혜(91)','김예은(98)','정은혜(98)'] },
      ],

      lifeGroups: [
        { num:1, leader:'조상운(92)', members:['조민희(91)','이호준(93)','김주찬(94)'] },
        { num:2, leader:'정지윤(95)', members:['조희래(95)','홍예찬(96)','유지훈(99)'] },
        { num:3, leader:'이시훈(96)', members:['김유찬(99)','신성민(01)','김수빈(06)','박조한(07)'] },
        { num:4, leader:'양한솔(91)', members:['고경혜(91)','양은정(94)','박예진(95)','김준희(99)'] },
        { num:5, leader:'김예은(98)', members:['송무늬(98)','정은혜(98)','김향(99)'] },
        { num:6, leader:'정예림(99)', members:['박희원(02)','양예원(03)','노해인(03)','김윤하(07)'] },
      ],

      jobs: [],
    };

    if (org.jobs.length === 0) {
      org.jobs = [
        { title:'팀빌딩',      members:['조희래(95)','홍예찬(96)','유지훈(99)','김유찬(99)','박희원(02)','김수빈(06)'] },
        { title:'디자인&데코', members:['송무늬(98)','정지윤(95)','박예진(95)','김예은(98)','양예원(03)'] },
        { title:'촬영',        members:['김주찬(94)','김준희(99)'] },
        { title:'웍듀티',      members:['조상운(92)','양한솔(91)','박조한(07)','김윤하(07)'] },
        { title:'의료지원',    members:['이시훈(96)','김향(99)'] },
        { title:'라스트키퍼',  members:['이호준(93)','양은정(94)','정은혜(98)'] },
        { title:'타임키퍼',    members:['고경혜(91)','조민희(91)'] },
      ];
    }

    return org;
  } catch(e) {
    console.error('org parse error', e);
    return {
      director:'박지명', subdirector:'정예림', accountant:'신성민', secretary:'노해인',
      leaderM:'조민희', leaderF:'고경혜', teams:[], lifeGroups:[], jobs:[]
    };
  }
}

function parseAttendance(json) {
  try {
    const rows = json?.table?.rows ?? [];
    const members = [];
    let dates = [];
    let headerParsed = false;

    for (const row of rows) {
      const name = safeStr(row, 1);
      const gender = safeStr(row, 2);

      // 헤더 행 (이름/날짜) 찾기
      if (name === '이름/날짜' || name === '이름') {
        dates = [];
        for (let i = 3; i < (row.c?.length ?? 0); i += 2) {
          const d = safeStr(row, i);
          if (d && d !== '비고' && d !== '합계' && d !== '공식모임 12번') dates.push(d);
        }
        headerParsed = true;
        continue;
      }

      if (!name || !headerParsed) continue;
      if (name === '합계' || name === '공식모임') continue;

      const att = [];
      for (let i = 3; i < (row.c?.length ?? 0); i += 2) {
        const v = safeStr(row, i);
        if (v === '' && att.length >= dates.length) break;
        if (i === 3 + dates.length * 2) break;
        if ((i - 3) % 2 === 0) {
          att.push(String(v).toLowerCase() === 'true' ? 1 : 0);
        }
      }
      if (name && att.length > 0) members.push({ name, gender, att });
    }

    return { dates, members };
  } catch(e) {
    console.error('att parse error', e);
    return { dates: [], members: [] };
  }
}

function parsePlan(json) {
  try {
    const rows = json?.table?.rows ?? [];
    const plans = [];
    const teamOrder = ['중보기도팀','하스피팀','어린이사역팀','문화사역팀','빅아이디어팀','예배팀'];

    let current = null;
    for (const row of rows) {
      const key = safeStr(row, 1);
      if (!key) continue;

      // 팀명 행
      if (teamOrder.includes(key)) {
        current = { name: key, purpose: '', goals: [], tasks: [], rain: '', writing: false };
        plans.push(current);
        continue;
      }
      if (!current) continue;

      if (key.includes('목적')) { current.purpose = safeStr(row, 2); }
      else if (key.includes('목표')) { const v = safeStr(row, 2); if (v) current.goals.push(v); }
      else if (key.includes('실행과제')) { const v = safeStr(row, 2); if (v) current.tasks.push(v); }
      else if (key.includes('우천')) { current.rain = safeStr(row, 2); }
    }

    // 빈 계획 → 작성 중 표시
    plans.forEach(p => {
      if (!p.purpose && p.goals.length === 0) p.writing = true;
    });

    return plans;
  } catch(e) { return []; }
}

function parseNotice(json) {
  try {
    const rows = json?.table?.rows ?? [];
    const notices = [];
    for (const row of rows) {
      const date  = safeStr(row, 1);
      const order = safeStr(row, 2);
      const ch    = safeStr(row, 3);
      const content = safeStr(row, 4);
      if (content && content !== '내용') notices.push({ date, order, ch, content });
    }
    return notices.slice(0, 2); // 최신 2개만
  } catch(e) { return []; }
}

/* ═══════════════════════════════════════════════
   5. 렌더러
═══════════════════════════════════════════════ */
function renderHomeScripture(result) {
  const el = document.getElementById('home-scripture');
  if (!el) return;
  if (!result.ok) {
    el.innerHTML = `<div class="scripture-block"><p class="scripture-text">푯대를 향하여 그리스도 예수 안에서 하나님이 위에서 부르신 부름의 상을 위하여 달려가노라</p><p class="scripture-ref">빌립보서 3:14</p></div>`;
    return;
  }
  const d = parseScripture(result.data);
  el.innerHTML = `
    ${result.offline ? '<div class="offline-badge">📴 오프라인 데이터</div>' : ''}
    <div class="scripture-block">
      <p class="scripture-text">"${escHtml(d.text)}"</p>
      <p class="scripture-ref">${escHtml(d.ref)}</p>
    </div>`;
  el.classList.add('fade-in');
}

function renderHomeOverview(result) {
  const el = document.getElementById('home-overview');
  if (!el) return;
  const d = result.ok ? parseOverview(result.data) : {};
  const rows = [
    { label: '기간',   val: d.period   || '2026.07.11 – 07.19 · 6박 8일' },
    { label: '장소',   val: d.place    || '카트만두 · 포카라' },
    { label: '인원',   val: '28명' },
    { label: '출발',   val: '2026.07.11 (토)' },
    { label: '귀국',   val: '2026.07.19 (일)' },
  ];
  el.innerHTML = rows.map((r,i) =>
    `<div class="row${i===rows.length-1?' style="padding-bottom:0;border-bottom:none"':''}">
      <span class="row-label">${escHtml(r.label)}</span>
      <span class="row-value">${escHtml(r.val)}</span>
    </div>`
  ).join('');
  el.classList.add('fade-in');
}

function renderHomeNextMeeting() {
  const el = document.getElementById('home-next-meeting');
  if (!el) return;
  const { items } = parseSchedule(null);
  const today = kstNow(); today.setHours(0,0,0,0);
  const next = items.find(item => {
    const d = new Date(item.date); d.setHours(0,0,0,0);
    return d >= today;
  });
  if (!next) {
    el.innerHTML = `<div class="next-row"><div class="next-dot"></div><div class="next-info"><div class="next-label">예정된 모임이 없습니다</div></div></div>`;
    return;
  }
  const dd = kstDday(next.date);
  const df = fmtDate(next.date);
  const ddTxt = dd > 0 ? `D-${dd}` : dd === 0 ? 'D-DAY' : '완료';
  const ddClass = dd === 0 ? 'pill-red' : dd > 0 ? 'pill-blue' : 'pill-gray';
  el.innerHTML = `
    <div class="next-row">
      <div class="next-dot"></div>
      <div class="next-info">
        <div class="next-label">${escHtml(next.title)}</div>
        <div class="next-detail">${df.full}</div>
      </div>
      <span class="pill ${ddClass}">${ddTxt}</span>
    </div>`;
  el.classList.add('fade-in');
}

function renderHomeNotice(result) {
  const section = document.getElementById('home-notice-section');
  const list = document.getElementById('home-notice-list');
  if (!section || !list || !result.ok) return;
  const notices = parseNotice(result.data);
  if (notices.length === 0) return;
  section.style.display = 'block';
  list.innerHTML = notices.map(n => `
    <div class="notice-card">
      <div class="notice-title">${escHtml(n.content)}</div>
      ${n.date ? `<div class="notice-date">${escHtml(n.date)}</div>` : ''}
    </div>`).join('');
}

function renderSchedule(result) {
  const listEl = document.getElementById('schedule-list');
  const afterEl = document.getElementById('after-list');
  const afterSec = document.getElementById('after-section');
  if (!listEl) return;

  if (!result.ok) {
    listEl.innerHTML = `<div class="error-state"><p class="error-msg">일정을 불러오지 못했습니다</p><button class="retry-btn" onclick="loadSchedule()">다시 시도</button></div>`;
    return;
  }

  const { items, afterItems } = parseSchedule(result.data);
  const today = kstNow(); today.setHours(0,0,0,0);

  if (items.length === 0) {
    listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📅</div><div class="empty-title">일정이 없습니다</div><div class="empty-desc">아직 작성된 일정이 없어요</div></div>`;
    return;
  }

  const pillMap = { team: 'pill-blue', school: 'pill-purple', special: 'pill-green', after: 'pill-red' };
  const labelMap = { team: '팀모임', school: '선교학교', special: '파송예배', after: '에프터' };

  function itemHtml(item) {
    const d = fmtDate(item.date);
    const itemDate = new Date(item.date); itemDate.setHours(0,0,0,0);
    const isPast = itemDate < today;
    return `
      <div class="sch-item${isPast ? ' past' : ''}">
        <div class="sch-date">
          <div class="sch-month">${d.mo}</div>
          <div class="sch-day">${d.day}</div>
          <div class="sch-wd">${d.wd}</div>
        </div>
        <div class="sch-divider"></div>
        <div class="sch-content">
          <div class="sch-title">${escHtml(item.title)}</div>
          ${item.detail ? `<div class="sch-detail">${escHtml(item.detail)}</div>` : ''}
          <div class="sch-badges">
            <span class="pill ${pillMap[item.type] || 'pill-gray'}">${labelMap[item.type] || item.type}</span>
          </div>
        </div>
      </div>`;
  }

  const sorted = [...items].sort((a,b) => new Date(a.date) - new Date(b.date));
  listEl.innerHTML = sorted.map(itemHtml).join('');
  listEl.classList.add('fade-in');

  if (afterItems.length > 0 && afterEl && afterSec) {
    afterSec.style.display = 'block';
    afterEl.innerHTML = afterItems.sort((a,b) => new Date(a.date) - new Date(b.date)).map(itemHtml).join('');
  }
}

// 이름에서 기수 추출해서 "xx년대" 형식으로 변환
// "박지명(90)" → { name:"박지명", peer:"90년대" }
// "박지명" → { name:"박지명", peer:"" }
function parseName(str) {
  const m = String(str).match(/^(.+?)\((\d{2})\)$/);
  if (m) return { name: m[1].trim(), peer: m[2] + '년대' };
  return { name: String(str).trim(), peer: '' };
}

function nameTag(str) {
  const { name, peer } = parseName(str);
  return peer
    ? `${escHtml(name)}<span class="peer-tag">${escHtml(peer)}</span>`
    : escHtml(name);
}

function renderTeam(result) {
  const el = document.getElementById('team-content');
  if (!el) return;

  if (!result.ok) {
    el.innerHTML = `<div class="error-state"><p class="error-msg">팀 정보를 불러오지 못했습니다</p><button class="retry-btn" onclick="loadTeam()">다시 시도</button></div>`;
    return;
  }

  const org = parseOrg(result.data);

  // 조직도 — C 스타일 3레벨 (디렉터 → 부디렉터 → 전체팀장/회계/서기)
  const orgHtml = `
    <div class="section-label">조직도</div>
    <div class="card" style="padding:20px 16px">
      <div class="org-chart">
        <div class="org-row">
          <div class="org-node dir">${escHtml(parseName(org.director).name)}<small>디렉터</small></div>
        </div>
        <div class="org-conn"></div>
        <div class="org-row">
          <div class="org-node subdir">${escHtml(parseName(org.subdirector).name)}<small>부디렉터</small></div>
        </div>
        <div class="org-conn"></div>
        <div class="org-row">
          <div class="org-node lead">${escHtml(parseName(org.leaderM).name)}<small>전체팀장(남)</small></div>
          <div class="org-node lead">${escHtml(parseName(org.leaderF).name)}<small>전체팀장(여)</small></div>
          <div class="org-node lead">${escHtml(parseName(org.accountant).name)}<small>회계</small></div>
          <div class="org-node lead">${escHtml(parseName(org.secretary).name)}<small>서기</small></div>
        </div>
      </div>
    </div>`;

  // 사역팀 — 팀장 포함 x명 제거, 이름 옆 또래 표시
  const teamsHtml = org.teams.length > 0 ? `
    <div class="section">
      <div class="section-label">사역팀</div>
      ${org.teams.map(t => {
        const meta = TEAM_META[t.name] || { icon:'⭐', color:'var(--blue)', bg:'var(--blue-bg)' };
        return `
          <div class="team-card">
            <div class="team-hd">
              <div class="team-icon" style="background:${meta.bg};color:${meta.color}">${meta.icon}</div>
              <div class="team-name">${escHtml(t.name)}</div>
            </div>
            <div class="team-bd">
              <div class="chips">
                <span class="chip leader">${escHtml(parseName(t.leader).name)}</span>
                ${t.members.map(m => `<span class="chip">${escHtml(parseName(m).name)}</span>`).join('')}
              </div>
            </div>
          </div>`;
      }).join('')}
    </div>` : '';

  // 생활조 — 이름 옆 또래 표시
  const lgHtml = org.lifeGroups.length > 0 ? `
    <div class="section">
      <div class="section-label">생활조</div>
      <div class="lg-grid">
        ${org.lifeGroups.map(g => `
          <div class="lg-card">
            <div class="lg-num">${g.num}</div>
            <div class="lg-leader"> ${escHtml(parseName(g.leader).name)}</div>
            <div class="chips">
              ${g.members.map(m => `<span class="chip">${escHtml(parseName(m).name)}</span>`).join('')}
            </div>
          </div>`).join('')}
      </div>
    </div>` : '';

  // JOB — 이름 옆 또래 표시
  const jobHtml = org.jobs.length > 0 ? `
    <div class="section" style="margin-bottom:0">
      <div class="section-label">JOB</div>
      <div class="card">
        ${org.jobs.map(j => {
          const meta = JOB_ICON[j.title] || { icon:'⭐', bg:'var(--bg)' };
          return `
            <div class="job-item">
              <div class="job-icon-box" style="background:${meta.bg}">${meta.icon}</div>
              <div>
                <div class="job-title">${escHtml(j.title)}</div>
                <div class="job-members">${j.members.map(m => escHtml(parseName(m).name)).join(' · ')}</div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>` : '';

  el.innerHTML = orgHtml + teamsHtml + lgHtml + jobHtml;
  el.classList.add('fade-in');
}

function renderPlan(result) {
  const el = document.getElementById('plan-list');
  if (!el) return;

  if (!result.ok) {
    el.innerHTML = `<div class="error-state"><p class="error-msg">사역계획을 불러오지 못했습니다</p><button class="retry-btn" onclick="loadPlan()">다시 시도</button></div>`;
    return;
  }

  const plans = parsePlan(result.data);

  // 팀이 없으면 기본 6개 팀 표시
  const teamOrder = ['중보기도팀','하스피팀','어린이사역팀','문화사역팀','빅아이디어팀','예배팀'];
  const finalPlans = teamOrder.map(name => {
    const found = plans.find(p => p.name === name);
    return found || { name, writing: true, purpose: '', goals: [], tasks: [], rain: '' };
  });

  const teamIcons = { '중보기도팀':'🙏','하스피팀':'🤝','어린이사역팀':'🌈','문화사역팀':'🎭','빅아이디어팀':'💡','예배팀':'🎵' };

  el.innerHTML = finalPlans.map((p, idx) => {
    const icon = teamIcons[p.name] || '⭐';
    const body = p.writing
      ? `<div class="plan-bd" id="plan-bd-${idx}" style="padding:20px;text-align:center"><span class="writing-pill">✏️ 작성 중</span></div>`
      : `<div class="plan-bd" id="plan-bd-${idx}">
          ${p.purpose ? `<div class="plan-sec"><div class="plan-sec-label">목적</div><p class="plan-text">${escHtml(p.purpose)}</p></div>` : ''}
          ${p.goals.length > 0 ? `<div class="plan-sec"><div class="plan-sec-label">목표</div><ul class="plan-ul">${p.goals.map(g=>`<li>${escHtml(g)}</li>`).join('')}</ul></div>` : ''}
          ${p.tasks.length > 0 ? `<div class="plan-sec"><div class="plan-sec-label">실행과제</div><ul class="plan-ul">${p.tasks.map(t=>`<li>${escHtml(t)}</li>`).join('')}</ul></div>` : ''}
          ${p.rain ? `<div class="plan-sec"><div class="plan-sec-label">우천시 계획</div><div class="plan-rain">☔ ${escHtml(p.rain)}</div></div>` : ''}
        </div>`;
    return `
      <div class="plan-card">
        <div class="plan-hd" onclick="togglePlan(${idx})">
          <span class="plan-icon">${icon}</span>
          <span class="plan-name">${escHtml(p.name)}</span>
          <span class="plan-arrow" id="plan-arrow-${idx}">▼</span>
        </div>
        ${body}
      </div>`;
  }).join('');

  el.classList.add('fade-in');
}

function renderAttendance(result) {
  const el = document.getElementById('att-content');
  if (!el) return;

  if (!result.ok) {
    el.innerHTML = `<div class="error-state"><p class="error-msg">출석 데이터를 불러오지 못했습니다</p><button class="retry-btn" onclick="loadAttendance()">다시 시도</button></div>`;
    return;
  }

  const { dates, members } = parseAttendance(result.data);

  if (members.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">아직 출석 데이터가 없어요</div></div>`;
    return;
  }

  // 통계
  let totalAtt = 0, totalPossible = 0;
  members.forEach(m => { totalAtt += m.att.reduce((a,b)=>a+b,0); totalPossible += m.att.length; });
  const rate = totalPossible > 0 ? Math.round(totalAtt / totalPossible * 100) : 0;

  const totalEl = document.getElementById('att-total');
  const rateEl  = document.getElementById('att-rate');
  const countEl = document.getElementById('att-count');
  if (totalEl) totalEl.textContent = members.length;
  if (rateEl)  rateEl.textContent  = rate + '%';
  if (countEl) countEl.textContent = dates.length;

  // 테이블: 날짜 세로 / 이름 가로
  const thead = `<thead><tr>
    <th>날짜 / 이름</th>
    ${members.map(m => `<th>${escHtml(m.name)}</th>`).join('')}
  </tr></thead>`;

  const tbody = `<tbody>${dates.map((date, di) => `
    <tr>
      <td>${escHtml(date)}</td>
      ${members.map(m => {
        const v = m.att[di];
        if (v === undefined) return '<td>—</td>';
        return v === 1
          ? '<td><span class="att-o">O</span></td>'
          : '<td><span class="att-x">✕</span></td>';
      }).join('')}
    </tr>`).join('')}</tbody>`;

  el.innerHTML = `<div class="att-table-outer"><table class="att-table">${thead}${tbody}</table></div>`;
  el.classList.add('fade-in');
}

/* ═══════════════════════════════════════════════
   6. 로드 함수
═══════════════════════════════════════════════ */
async function loadHome() {
  const [scriptureResult, overviewResult, noticeResult] = await Promise.all([
    fetchSheetSafe(SHEETS.scripture),
    fetchSheetSafe(SHEETS.overview),
    fetchSheetSafe(SHEETS.notice),
  ]);
  renderHomeScripture(scriptureResult);
  renderHomeOverview(overviewResult);
  renderHomeNextMeeting();
  renderHomeNotice(noticeResult);
}

async function loadSchedule() {
  // 일정은 하드코딩 - dummy ok result로 바로 렌더
  renderSchedule({ ok: true, data: null, offline: false });
}

async function loadTeam() {
  const result = await fetchSheetSafe(SHEETS.org);
  renderTeam(result);
}

async function loadPlan() {
  const result = await fetchSheetSafe(SHEETS.plan);
  renderPlan(result);
}

async function loadAttendance() {
  const result = await fetchSheetSafe(SHEETS.attendance);
  renderAttendance(result);
}

/* ═══════════════════════════════════════════════
   7. 날씨
═══════════════════════════════════════════════ */
async function loadWeather() {
  try {
    const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current=temperature_2m,weathercode&timezone=Asia%2FKathmandu');
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weathercode;
    const desc = code <= 1 ? '맑음' : code <= 3 ? '구름 조금' : code <= 48 ? '안개' : code <= 67 ? '비' : code <= 77 ? '눈' : code <= 82 ? '소나기' : '뇌우';
    const tempEl = document.getElementById('w-temp');
    const descEl = document.getElementById('w-desc');
    if (tempEl) tempEl.textContent = temp;
    if (descEl) descEl.textContent = desc;
  } catch(e) {
    const descEl = document.getElementById('w-desc');
    if (descEl) descEl.textContent = '정보 없음';
  }
}

/* ═══════════════════════════════════════════════
   8. D-day
═══════════════════════════════════════════════ */
function updateDday() {
  const dep = kstDday(DEPARTURE_DATE);
  const depEl   = document.getElementById('dday-dep');
  const unitEl  = document.getElementById('dday-dep-unit');
  const kvDdEl  = document.getElementById('kv-dday');

  if (!depEl) return;
  if (dep > 0) {
    depEl.textContent  = dep;
    if (unitEl) unitEl.textContent = '일 남음';
    if (kvDdEl) kvDdEl.textContent = `D-${dep}`;
  } else if (dep === 0) {
    depEl.textContent  = 'D-DAY';
    if (unitEl) unitEl.textContent = '오늘 출발!';
    if (kvDdEl) kvDdEl.textContent = 'D-DAY';
  } else {
    depEl.textContent  = Math.abs(dep);
    if (unitEl) unitEl.textContent = '일째 선교 중';
    if (kvDdEl) kvDdEl.textContent = '선교 중';
  }
}

/* ═══════════════════════════════════════════════
   9. PRESS ON 인터랙션 (dim 방식)
═══════════════════════════════════════════════ */
function initPressOn() {
  const pressEl = document.getElementById('pressOn');
  if (!pressEl) return;

  // dim overlay 생성
  const dimEl = document.createElement('div');
  dimEl.className = 'dim-overlay';
  document.body.appendChild(dimEl);

  let pressTimer = null;
  let isHolding = false;

  function startPress() {
    isHolding = true;
    pressEl.classList.add('pressing');
    // dim 서서히 어두워지기 시작
    dimEl.classList.add('active');
    pressTimer = setTimeout(() => {
      if (isHolding) openKV();
    }, HOLD_MS);
  }

  function cancelPress() {
    if (!isHolding) return;
    isHolding = false;
    pressEl.classList.remove('pressing');
    clearTimeout(pressTimer);
    dimEl.classList.remove('active');
  }

  pressEl.addEventListener('mousedown', startPress);
  pressEl.addEventListener('touchstart', e => { e.preventDefault(); startPress(); }, { passive: false });
  pressEl.addEventListener('mouseup', cancelPress);
  pressEl.addEventListener('mouseleave', cancelPress);
  pressEl.addEventListener('touchend', cancelPress);
  pressEl.addEventListener('touchcancel', cancelPress);

  document.getElementById('kvClose')?.addEventListener('click', closeKV);
}

function openKV() {
  const home = document.getElementById('homeView');
  const wrap = document.getElementById('kvOverlay');
  const inner = document.getElementById('kvInner');
  const pressEl = document.getElementById('pressOn');
  const dimEl = document.querySelector('.dim-overlay');
  if (pressEl) pressEl.classList.remove('pressing');
  if (dimEl) dimEl.classList.remove('active');
  if (home) { home.style.opacity = '0'; home.style.transition = 'opacity .2s'; }
  setTimeout(() => {
    if (home) home.style.display = 'none';
    if (wrap) wrap.style.display = 'block';
    requestAnimationFrame(() => requestAnimationFrame(() => { if (inner) inner.classList.add('show'); }));
  }, 200);
}

function closeKV() {
  const home = document.getElementById('homeView');
  const wrap = document.getElementById('kvOverlay');
  const inner = document.getElementById('kvInner');
  if (inner) inner.classList.remove('show');
  setTimeout(() => {
    if (wrap) wrap.style.display = 'none';
    if (home) { home.style.display = 'block'; home.style.opacity = '0'; }
    requestAnimationFrame(() => { if (home) home.style.opacity = '1'; });
  }, 300);
}

/* ═══════════════════════════════════════════════
   10. 아코디언 (사역계획 + 선교 이야기)
═══════════════════════════════════════════════ */
function togglePlan(idx) {
  const bd    = document.getElementById(`plan-bd-${idx}`);
  const arrow = document.getElementById(`plan-arrow-${idx}`);
  if (!bd) return;
  const isOpen = bd.classList.contains('open');
  bd.classList.toggle('open', !isOpen);
  if (arrow) arrow.classList.toggle('open', !isOpen);
}

function toggleStory(idx) {
  const bd    = document.getElementById(`story-bd-${idx}`);
  const arrow = document.getElementById(`story-arrow-${idx}`);
  if (!bd) return;
  const isOpen = bd.classList.contains('open');
  bd.classList.toggle('open', !isOpen);
  if (arrow) arrow.classList.toggle('open', !isOpen);
}

/* ═══════════════════════════════════════════════
   11. 메뉴 (헤더 확장형)
═══════════════════════════════════════════════ */
const loaded = new Set();
let menuOpen = false;

function toggleMenu() {
  menuOpen ? closeMenu() : openMenu();
}

function openMenu() {
  menuOpen = true;
  document.getElementById('navMenu').classList.add('open');
  document.getElementById('hamburgerBtn').classList.add('open');
  document.getElementById('contentDim').classList.add('on');
}

function closeMenu() {
  menuOpen = false;
  document.getElementById('navMenu').classList.remove('open');
  document.getElementById('hamburgerBtn').classList.remove('open');
  document.getElementById('contentDim').classList.remove('on');
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.drawer-item').forEach(b => b.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  const btn  = document.querySelector(`.drawer-item[data-page="${id}"]`);
  if (page) page.classList.add('active');
  if (btn)  btn.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMenu();

  if (!loaded.has(id)) {
    loaded.add(id);
    if (id === 'schedule')   loadSchedule();
    if (id === 'team')       loadTeam();
    if (id === 'plan')       loadPlan();
    if (id === 'attendance') loadAttendance();
  }
}

document.querySelectorAll('.drawer-item').forEach(btn => {
  btn.addEventListener('click', () => showPage(btn.dataset.page));
});

// 서브탭 (일정)
document.querySelectorAll('.sub-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.sub-page').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const sub = document.getElementById('sub-' + btn.dataset.sub);
    if (sub) sub.classList.add('active');
  });
});

/* ═══════════════════════════════════════════════
   12. 새로고침
═══════════════════════════════════════════════ */
async function refreshAll() {
  await Promise.all([ loadHome(), loadWeather() ]);
  const activeId = document.querySelector('.page.active')?.id?.replace('page-','');
  if (activeId === 'schedule')   await loadSchedule();
  if (activeId === 'team')       await loadTeam();
  if (activeId === 'plan')       await loadPlan();
  if (activeId === 'attendance') await loadAttendance();
}

/* ═══════════════════════════════════════════════
   13. 스크롤 TOP 버튼
═══════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const btn = document.getElementById('scroll-top');
  if (btn) btn.classList.toggle('visible', window.scrollY > 160);
});

/* ═══════════════════════════════════════════════
   14. visibilitychange 재fetch
═══════════════════════════════════════════════ */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') refreshAll();
});

/* ═══════════════════════════════════════════════
   15. 초기화
═══════════════════════════════════════════════ */
async function init() {
  updateDday();
  initPressOn();
  loaded.add('home');
  await Promise.all([ loadHome(), loadWeather() ]);
}

init();
