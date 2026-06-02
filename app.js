"use strict";

/* ═══════════════════════════════════════════════
   1. 상수 / 설정
═══════════════════════════════════════════════ */
const SPREADSHEET_ID = "1GlDOaRDkmNnyF-u3RKigjlhB1OsMeQ2GHks9dQ5u6pc";
const CACHE_VERSION = "v1";
const DEPARTURE_DATE = "2026-07-11";
const HOLD_MS = 800; // PRESS ON 꾹 누르기 시간

const SHEETS = {
  scripture: "💍 약속의 말씀",
  overview: "🌍 선교개요",
  schedule: "📅 전체일정",
  attendance: "✅ 출석체크",
  org: "🤝 조직도 ㅣ 💼 JOB ㅣ 👫 생활조",
  plan: "📝 팀별사역계획",
  notice: "🎤 공지",
  luggageTeam: "👍각 팀 별도 탭",
  luggageRental: "🎹물품대여현황",
};

const CONFIG = {
  luggage: { enabled: true },
  notice: { enabled: true },
  checklist: { enabled: false },
};

const TEAM_META = {
  인터씨드팀: { icon: "🙏", color: "var(--purple)", bg: "var(--purple-bg)" },
  하스피팀: { icon: "🤝", color: "var(--blue)", bg: "var(--blue-bg)" },
  어린이사역팀: { icon: "🌈", color: "var(--yellow)", bg: "var(--yellow-bg)" },
  문화사역팀: { icon: "🎭", color: "var(--green)", bg: "var(--green-bg)" },
  빅아이디어팀: { icon: "💡", color: "var(--red)", bg: "var(--red-bg)" },
  예배팀: { icon: "🎵", color: "#FF6B9D", bg: "#FFF0F7" },
};

const JOB_ICON = {
  팀빌딩: { icon: "🏗️", bg: "var(--blue-bg)" },
  "디자인&데코": { icon: "🎨", bg: "#FFF0F7" },
  촬영: { icon: "📷", bg: "var(--green-bg)" },
  웍듀티: { icon: "🍽️", bg: "var(--yellow-bg)" },
  의료지원: { icon: "🏥", bg: "var(--red-bg)" },
  라스트키퍼: { icon: "🔑", bg: "var(--purple-bg)" },
  타임키퍼: { icon: "⏰", bg: "var(--bg)" },
};

// 사역팀별 상세 사역 내용 (선교 모임 / 현지 선교)
const TEAM_DETAIL = {
  인터씨드팀: {
    meeting: [
      "모임 시 현지어 공부 진행",
      "영성 관리 시스템 구축 — 매일 아침 7시 묵상 · 정오 리마인드 · 저녁 9시 기도 제목 공유로 이어지는 일일 영성 루틴을 시스템화하여 팀원들의 참여를 유도한다.",
      "익명 기도 소통망 운영 — '기도의 우체통(오픈채팅)'을 개설하여 심리적 부담 없이 내적 고민을 나눌 수 있는 안전한 소통 창구를 마련한다.",
      "현지 인문/종교 리서치 — 네팔 주요 인터씨드 장소의 배경 지식을 분석하여, 기도의 명확한 방향성을 제시하는 가이드 문서를 제작한다.",
      "영적 몰입도 강화 — '릴레이 금식기도' 일정을 기획 및 실행한다.",
      "예배 중보기도 인도 — 팀장이 예배 시 기도회를 인도한다.",
    ],
    field: [
      "현장 기도회 리딩 — 돌발 변수가 많은 현지 사역지 및 사원 방문 시, 선제적으로 준비된 기도 제목을 선포하고 팀의 영적 포커스를 유지시킨다.",
    ],
  },
  하스피팀: {
    meeting: [
      "생일자 축하",
      "밀도 있는 환대 프로세스 — 매 모임 전 공간의 분위기를 바꾸는 '웰컴 존'을 운영(디자인&데코, 팀빌딩과 협업)하고, 네팔 현지식(달밧) 사전 체험을 통해 현지 적응력을 테스트한다.",
      "스낵바 키트화 운영",
      "모임 중 점심 식사 및 간식 구매",
      "개인화된 컨디션 케어 키트 — 팀원 개개인의 체질(알러지, 기타 건강 사항도 함께 체크 → 구글폼으로 종합)을 고려하여 멀미약, 모기기피제, 비타민, 마른반찬, 소스 등이 포함된 맞춤형 지퍼백 꾸러미를 조달 및 패킹한다.",
    ],
    field: [
      "선교사님 격려 사역 준비",
      "에너지 공급 컨트롤 타워 — 현지 식사만으로 부족한 영양을 계산하여, 적재적소에 한국 부식과 간식을 배급함으로써 팀원들의 번아웃을 방지한다.",
      "격려 사역 현장 총괄 — 기획된 세족식과 애찬식을 진행하며, 팀원들의 깊은 정서적 교감을 끌어낸다.",
    ],
  },
  어린이사역팀: {
    meeting: [
      "모듈형 사역 프로그램 설계 — 찬양, 풍선아트, 페이스페인팅, 복음팔찌 제작 등 각 세션의 도안 및 매뉴얼을 확립하고, 누구든 빈자리를 대체할 수 있도록 '크로스 트레이닝(Cross-training)'을 실시한다.",
      "복음팔찌 스토리텔링 체화 — 선교사님이 제공한 영문 대본을 번역하여, 전 팀원이 영어나 네팔어로 핵심 메시지를 5분 이내에 프레젠테이션할 수 있도록 훈련시킨다.",
      "물자 및 리소스 산출 — 예상 인원의 2배수(약 60명)를 감당할 수 있는 물품(풍선 600개, 포토프린터 인화지, 한국 과자 등)의 소분 및 패킹을 완료한다.",
    ],
    field: [
      "모듈별 부스 운영 및 변수 통제 — 1부(찬양/복음팔찌)와 2부(액티비티)를 유기적으로 전환하며, 대기 시간이 발생하는 어린이들을 위한 플랜 B(비눗방울 놀이 등)를 즉각 가동한다.",
    ],
  },
  문화사역팀: {
    meeting: [
      "퍼포먼스 디테일 최적화 — K-POP 태권무(파이팅해야지)의 동선, 약속 대련, 격파 순서를 짜임새 있게 구성하고 무반주 상황까지 대비하여 연습한다.",
      "스킷 드라마 메시지 시각화 — 'Everything' 스킷의 난해한 개념(창조, 죄악 등)을 직관적으로 전달하기 위해 중보기도팀과 협력하여 대형 부직포, 가면 등의 입체적 소품을 제작한다.",
    ],
    field: [
      "현장 맞춤형 스테이징 — 흙바닥, 좁은 공간 등 통제 불가능한 현장 컨디션을 빠르게 파악하여 퍼포먼스 동선을 즉석에서 재조정한다.",
      "전천후 사역 지원 — 본 팀의 공연이 종료된 후에는 즉각적으로 어린이 사역 부스나 체육대회 스태프로 전환하여 조직의 유연성을 극대화한다.",
    ],
  },
  빅아이디어팀: {
    meeting: [
      "열사병 대책 강구",
      "포카라 트래킹에 관한 전반적인 사항 리서치 및 아이디어 실행",
      "마스터 매뉴얼(책자) 편찬 — 사역 일정, 조직도, 네팔어 회화, 찬양 악보 등 분산된 정보를 규합하여 한눈에 볼 수 있는 '현장 지침서'를 디자인 및 인쇄한다.",
      "청장년 운동회 기획 및 시뮬레이션 — 언어 장벽을 넘어설 수 있는 직관적인 게임(미션 계주, 코끼리코 등)을 선별하고, 팀 빌딩을 위한 반다나 및 시상 용품을 세팅한다.",
      "조직 리스크 및 환경 관리 — 항공 수하물 규정, 현지 우천 대비용 공용 우비 조달 등 발생 가능한 환경적 리스크를 사전에 차단한다.",
      "물갈이 이슈 등 건강에 관한 보완 대책 강구",
    ],
    field: [
      "동선 및 군중 통제(Crowd Control) — 어린이 사역 시 발생할 수 있는 혼잡을 막기 위해 노끈과 스탬프 등을 활용해 안전한 이동 동선을 확보한다.",
      "운동회 현장 지휘 — 꺼랄교회 청장년 운동회 시 메인 진행과 점수 집계를 총괄하여 전체적인 축제 분위기를 리드한다.",
    ],
  },
  예배팀: {
    meeting: [
      "예배 환경 세팅 — 매주 모임의 찬양을 인도하며, 사전에 악기(기타, 카혼 등)와 음향 장비의 세팅을 완비한다.",
      "현지어 특송 디렉팅 — '던야받 예수' 등 현지인들과 교감할 수 있는 네팔어 찬양을 발굴하고 전 팀원이 암기할 수 있도록 교육한다.",
    ],
    field: [
      "이동 및 현장 어쿠스틱 예배 인도 — 버스 이동 시간이나 마이크가 없는 열악한 현지 사역지에서 어쿠스틱 악기를 활용해 예배의 흐름을 끊김 없이 이어간다.",
    ],
  },
};

// JOB별 역할 설명
const JOB_DETAIL = {
  팀빌딩: "선교팀원들의 친교를 담당한다. 매주 선교팀 안에서 깊은 교제가 일어날 수 있도록 프로그램을 계획하고 진행한다.",
  "디자인&데코": "현지에서의 숙소환경, 센터환경, 선교팀의 외적인 분위기를 담당한다. 디렉터가 요구하는 사항을 디자인으로 연출한다.",
  촬영: "선교팀의 모든 일정을 사진으로 기록한다. 선교 관련 정보를 사진과 영상으로 촬영 및 편집한다.",
  웍듀티: "모임장소, 숙소 및 사역현장을 정리하고 청소를 담당하는 역할로서, 청소를 구상하고 팀원들에게 분배하여 청소를 진행하는 역할이다.",
  의료: "선교기간 동안 의료를 담당한다. 위급사항 시 보고를 생략하고 선조치 후보고를 취한다.",
  의료지원: "선교기간 동안 의료를 담당한다. 위급사항 시 보고를 생략하고 선조치 후보고를 취한다.",
  라스트키퍼: "팀이 이동을 할 때 마지막까지 남아서 빠진 인원은 없는지, 놓고가는 물건은 없는지 챙기며 사역 또는 장소 이동의 매듭을 지어주는 역할이다.",
  타임키퍼: "선교 중 기상·취침, 각종 모임 시간의 안내와 집합을 담당하는 역할이다. 흩어졌다가 다시 모이거나 시간을 지켜 움직여야 할 때 시간을 공지하고 알림 역할을 한다.",
};

/* ═══════════════════════════════════════════════
   2. 유틸리티
═══════════════════════════════════════════════ */
function kstNow() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  );
}

function kstDday(dateStr) {
  const now = kstNow();
  now.setHours(0, 0, 0, 0);
  const t = new Date(dateStr);
  t.setHours(0, 0, 0, 0);
  return Math.ceil((t - now) / 86400000);
}

function fmtDate(dateStr) {
  const d = new Date(dateStr);
  const WD = ["일", "월", "화", "수", "목", "금", "토"];
  const MO = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];
  return {
    mo: MO[d.getMonth()],
    day: d.getDate(),
    wd: WD[d.getDay()],
    full: `${d.getMonth() + 1}/${d.getDate()} (${WD[d.getDay()]})`,
  };
}

function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeVal(row, idx) {
  return row?.c?.[idx]?.v ?? "";
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
    localStorage.setItem(
      cacheKey(sheetName),
      JSON.stringify({ ts: Date.now(), data }),
    );
  } catch (e) {}
}

function loadCache(sheetName) {
  try {
    const raw = localStorage.getItem(cacheKey(sheetName));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function clearCache(sheetName) {
  try {
    localStorage.removeItem(cacheKey(sheetName));
  } catch (e) {}
}

async function fetchSheet(sheetName) {
  // cache-busting: 매번 다른 URL로 요청해서 Google CDN 캐시 우회
  const ts = Date.now();
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&_=${ts}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const match = text.match(
    /google\.visualization\.Query\.setResponse\(([\s\S]*)\)/,
  );
  if (!match) throw new Error("파싱 실패");
  return JSON.parse(match[1]);
}

async function fetchSheetSafe(sheetName) {
  try {
    const json = await fetchSheet(sheetName);
    saveCache(sheetName, json);
    return { ok: true, data: json, offline: false };
  } catch (e) {
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
      if (v && v.includes("빌")) {
        // "말씀/슬로건" 행 파싱
        const match = v.match(/^(.+?)\((.+?)\)/);
        if (match) return { text: match[1].trim(), ref: match[2].trim() };
        return { text: v, ref: "빌립보서 3:14" };
      }
    }
  } catch (e) {}
  return {
    text: "푯대를 향하여 그리스도 예수 안에서 하나님이 위에서 부르신 부름의 상을 위하여 달려가노라",
    ref: "빌립보서 3:14",
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
      if (key.includes("슬로건") || key.includes("주제")) result.slogan = val;
      else if (key.includes("약속")) result.scripture = val;
      else if (key.includes("일시")) result.period = val;
      else if (key.includes("장소")) result.place = val;
      else if (key.includes("대상")) result.members = val;
    }
    return result;
  } catch (e) {
    return {};
  }
}

function parseSchedule(json) {
  // 시트 파싱 대신 확정된 한국 일정 하드코딩
  // (gviz API 캘린더 구조가 복잡해 파싱 불안정 → 하드코딩으로 안정화)
  const items = [
    {
      date: "2026-05-30",
      title: "팀모임 1",
      detail: "웰컴 · 기대 나누기",
      type: "team",
    },
    {
      date: "2026-05-31",
      title: "선교학교 1 / 팀모임 2",
      detail: "여름단기선교의 중요성",
      type: "school",
    },
    { date: "2026-06-06", title: "팀모임 3", detail: "", type: "team" },
    {
      date: "2026-06-07",
      title: "선교학교 2 / 팀모임 4",
      detail: "단기선교 준비",
      type: "school",
    },
    { date: "2026-06-13", title: "팀모임 5", detail: "", type: "team" },
    {
      date: "2026-06-14",
      title: "선교학교 3 / 팀모임 6",
      detail: "JOB",
      type: "school",
    },
    { date: "2026-06-20", title: "팀모임 7", detail: "", type: "team" },
    {
      date: "2026-06-21",
      title: "선교학교 4 / 팀모임 8",
      detail: "영적인 일",
      type: "school",
    },
    { date: "2026-06-27", title: "팀모임 9", detail: "", type: "team" },
    {
      date: "2026-06-28",
      title: "선교학교 5 / 팀모임 10",
      detail: "하나 됨 · 파송예배",
      type: "school",
    },
    { date: "2026-06-28", title: "파송예배", detail: "", type: "special" },
    {
      date: "2026-07-04",
      title: "팀모임 11",
      detail: "최종 리허설 · 짐 패킹",
      type: "team",
    },
    {
      date: "2026-07-05",
      title: "팀모임 12",
      detail: "짐 패킹 2",
      type: "team",
    },
  ];

  const afterItems = [
    { date: "2026-08-02", title: "전체 에프터", detail: "", type: "after" },
    {
      date: "2026-08-16",
      title: "보고예배 · 사진전",
      detail: "",
      type: "after",
    },
  ];

  return { items, afterItems };
}

function parseOrg(json) {
  try {
    const rows = json?.table?.rows ?? [];

    // ── 조직도 하드코딩 ──────────────────────────
    const org = {
      director: "박지명(90)",
      subdirector: "정예림(99)",
      accountant: "신성민(01)",
      secretary: "노해인(03)",
      leaderM: "조민희(91)",
      leaderF: "고경혜(91)",

      teams: [
        {
          name: "인터씨드팀",
          leader: "정예림(99)",
          members: ["조민희(91)", "유지훈(99)", "노해인(03)"],
        },
        {
          name: "하스피팀",
          leader: "조희래(95)",
          members: ["정지윤(95)", "양한솔(91)", "김준희(99)"],
        },
        {
          name: "어린이사역팀",
          leader: "김주찬(94)",
          members: [
            "신성민(01)",
            "박예진(95)",
            "박희원(02)",
            "양예원(03)",
            "김윤하(07)",
          ],
        },
        {
          name: "문화사역팀",
          leader: "양은정(94)",
          members: ["조상운(92)", "송무늬(98)", "이시훈(96)", "김유찬(99)"],
        },
        {
          name: "빅아이디어팀",
          leader: "이호준(93)",
          members: ["김수빈(06)", "김향(99)"],
        },
        {
          name: "예배팀",
          leader: "홍예찬(96)",
          members: ["박조한(07)", "고경혜(91)", "김예은(98)", "정은혜(98)"],
        },
      ],

      lifeGroups: [
        {
          num: 1,
          leader: "조상운(92)",
          members: ["조민희(91)", "이호준(93)", "김주찬(94)"],
        },
        {
          num: 2,
          leader: "정지윤(95)",
          members: ["조희래(95)", "홍예찬(96)", "유지훈(99)"],
        },
        {
          num: 3,
          leader: "이시훈(96)",
          members: ["김유찬(99)", "신성민(01)", "김수빈(06)", "박조한(07)"],
        },
        {
          num: 4,
          leader: "양한솔(91)",
          members: ["고경혜(91)", "양은정(94)", "박예진(95)", "김준희(99)"],
        },
        {
          num: 5,
          leader: "김예은(98)",
          members: ["송무늬(98)", "정은혜(98)", "김향(99)"],
        },
        {
          num: 6,
          leader: "정예림(99)",
          members: ["박희원(02)", "양예원(03)", "노해인(03)", "김윤하(07)"],
        },
      ],

      jobs: [],
    };

    if (org.jobs.length === 0) {
      org.jobs = [
        {
          title: "팀빌딩",
          members: [
            "조희래(95)",
            "홍예찬(96)",
            "유지훈(99)",
            "김유찬(99)",
            "박희원(02)",
            "김수빈(06)",
          ],
        },
        {
          title: "디자인&데코",
          members: [
            "송무늬(98)",
            "정지윤(95)",
            "박예진(95)",
            "김예은(98)",
            "양예원(03)",
          ],
        },
        { title: "촬영", members: ["김주찬(94)", "김준희(99)"] },
        {
          title: "웍듀티",
          members: ["조상운(92)", "양한솔(91)", "박조한(07)", "김윤하(07)"],
        },
        { title: "의료지원", members: ["이시훈(96)", "김향(99)"] },
        {
          title: "라스트키퍼",
          members: ["이호준(93)", "양은정(94)", "정은혜(98)"],
        },
        { title: "타임키퍼", members: ["고경혜(91)", "조민희(91)"] },
      ];
    }

    return org;
  } catch (e) {
    console.error("org parse error", e);
    return {
      director: "박지명",
      subdirector: "정예림",
      accountant: "신성민",
      secretary: "노해인",
      leaderM: "조민희",
      leaderF: "고경혜",
      teams: [],
      lifeGroups: [],
      jobs: [],
    };
  }
}

// 출석 시트 구조 (확정):
// A=번호, B=이름, C=성별
// D=1차 체크, E=비고1, F=2차 체크, G=비고2, ...
// 체크박스 컬럼 인덱스: 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25
const ATTENDANCE_DATES = [
  { idx: 3, label: "5/30", day: "토" },
  { idx: 5, label: "5/31", day: "주" },
  { idx: 7, label: "6/6", day: "토" },
  { idx: 9, label: "6/7", day: "주" },
  { idx: 11, label: "6/13", day: "토" },
  { idx: 13, label: "6/14", day: "주" },
  { idx: 15, label: "6/20", day: "토" },
  { idx: 17, label: "6/21", day: "주" },
  { idx: 19, label: "6/27", day: "토" },
  { idx: 21, label: "6/28", day: "주" },
  { idx: 23, label: "7/4", day: "토" },
  { idx: 25, label: "7/5", day: "주" },
];

// 팀원 28명 명단 (시트 순서, 가나다순)
const MEMBER_NAMES = [
  "고경혜", "김수빈", "김예은", "김유찬", "김윤하",
  "김주찬", "김준희", "김향", "노해인", "박예진",
  "박조한", "박지명", "박희원", "송무늬", "신성민",
  "양예원", "양은정", "양한솔", "유지훈", "이시훈",
  "이호준", "정예림", "정은혜", "정지윤", "조민희",
  "조상운", "조희래", "홍예찬",
];

// 전체 일정 데이터 (일정 탭 + 홈 다음 모임 카드 공통 사용)
const SCHEDULE_ITEMS = [
  { date: "2026-05-30", day: "토", title: "팀모임1 (환영)", detail: "", place: "비전5", badges: ["team"] },
  { date: "2026-05-31", day: "주", title: "선교학교1 / 팀모임2 (시작)", detail: "여름단기선교의 중요성", place: "채움1", badges: ["school", "team"] },
  { date: "2026-06-06", day: "토", title: "팀모임3 (구상)", detail: "", place: "", badges: ["team"] },
  { date: "2026-06-07", day: "주", title: "선교학교2 / 팀모임4 (실행)", detail: "단기선교 준비", place: "다움2", badges: ["school", "team"] },
  { date: "2026-06-13", day: "토", title: "팀모임5 (등산)", detail: "인왕산 등산", place: "", badges: ["team"] },
  { date: "2026-06-14", day: "주", title: "선교학교3 / 팀모임6 (연습)", detail: "JOB", place: "채움3, 미팅룸3/4", badges: ["school", "team"] },
  { date: "2026-06-20", day: "토", title: "팀모임7 (최상화)", detail: "", place: "", badges: ["team"] },
  { date: "2026-06-21", day: "주", title: "선교학교4 / 팀모임8 (디테일)", detail: "영적인 일", place: "채움2, 미팅룸14", badges: ["school", "team"] },
  { date: "2026-06-27", day: "토", title: "팀모임9 (세미리허설)", detail: "전체회식", place: "비전5", badges: ["team"] },
  { date: "2026-06-28", day: "주", title: "선교학교5 / 팀모임10 (보완) / 파송예배", detail: "하나 됨", place: "비전5", badges: ["school", "team", "special"] },
  { date: "2026-07-04", day: "토", title: "팀모임11 (최종리허설)", detail: "새벽예배특송 · 짐패킹 1차", place: "채움2, 미팅룸14", badges: ["team"] },
  { date: "2026-07-05", day: "주", title: "팀모임12", detail: "짐패킹 2차", place: "다움2", badges: ["team"] },
  { date: "2026-08-02", day: "주", title: "전체에프터", detail: "", place: "", badges: ["after"] },
  { date: "2026-08-16", day: "주", title: "보고예배", detail: "", place: "", badges: ["after"] },
];

function parseAttendance(json) {
  try {
    const rows = json?.table?.rows ?? [];
    // 시트에서 받은 데이터를 이름으로 매핑
    const sheetData = {};

    for (const row of rows) {
      const num = safeStr(row, 0);
      const name = safeStr(row, 1);
      if (!name || name === "이름/날짜" || name === "이름") continue;
      if (!num || isNaN(parseInt(num))) continue;
      if (name === "합계" || name === "공식모임") continue;

      // 각 날짜 체크박스 컬럼을 정확한 인덱스로 직접 읽기
      const att = ATTENDANCE_DATES.map((d) => {
        const cells = row.c || [];
        const cell = cells[d.idx];
        if (!cell) return 0;
        const v = cell.v;
        if (v === true) return 1;
        if (typeof v === "string" && v.toUpperCase() === "TRUE") return 1;
        return 0;
      });

      sheetData[name] = att;
    }

    // 28명 명단 기준으로 항상 뼈대 생성 (시트 데이터 없으면 전부 0)
    const members = MEMBER_NAMES.map((name) => ({
      name,
      att: sheetData[name] || ATTENDANCE_DATES.map(() => 0),
    }));

    const dates = ATTENDANCE_DATES.map((d) => d.label);
    return { dates, members };
  } catch (e) {
    console.error("att parse error", e);
    // 에러 시에도 뼈대는 보여줌
    const members = MEMBER_NAMES.map((name) => ({
      name,
      att: ATTENDANCE_DATES.map(() => 0),
    }));
    const dates = ATTENDANCE_DATES.map((d) => d.label);
    return { dates, members };
  }
}

// 사역계획 시트 구조 (확정):
// B열 = key (목적/1) 목표/2) 목표/3) 목표/1) 실행과제/.../우천시계획/팀명)
// C열 = value
// 첫 번째 팀(중보기도팀=인터씨드팀)은 row에 팀명이 없고 헤더 라벨에 박혀있음
// → 시트 시작 시점부터 기본 팀명을 "중보기도팀"으로 시작
const PLAN_TEAM_ORDER = [
  "중보기도팀", // = 인터씨드팀 (웹 표시)
  "하스피팀",
  "어린이사역팀",
  "문화사역팀",
  "빅아이디어팀",
  "예배팀",
];

// 시트 팀명 → 웹 팀명 매핑
const PLAN_TEAM_NAME_MAP = {
  중보기도팀: "인터씨드팀",
};

function parsePlan(json) {
  try {
    const rows = json?.table?.rows ?? [];
    const plans = [];

    // 첫 번째 팀은 시트 헤더에 박혀있으므로 자동으로 시작
    let current = {
      name: PLAN_TEAM_NAME_MAP[PLAN_TEAM_ORDER[0]] || PLAN_TEAM_ORDER[0],
      purpose: "",
      goals: [],
      tasks: [],
      rain: "",
      writing: false,
    };
    plans.push(current);

    for (const row of rows) {
      const key = safeStr(row, 1);
      const value = safeStr(row, 2);
      if (!key) continue;

      // 팀명 행 발견 → 새 팀 시작
      if (PLAN_TEAM_ORDER.includes(key)) {
        current = {
          name: PLAN_TEAM_NAME_MAP[key] || key,
          purpose: "",
          goals: [],
          tasks: [],
          rain: "",
          writing: false,
        };
        plans.push(current);
        continue;
      }
      if (!current) continue;

      // 정확한 매칭으로 파싱
      if (key === "목적") {
        current.purpose = value;
      } else if (/^[1-9]\)\s*목표$/.test(key)) {
        if (value) current.goals.push(value);
      } else if (/^[1-9]\)\s*실행과제$/.test(key)) {
        if (value) current.tasks.push(value);
      } else if (key === "우천시계획" || key === "우천 시 계획") {
        current.rain = value;
      }
    }

    // 빈 계획 → 작성 중 표시
    plans.forEach((p) => {
      if (!p.purpose && p.goals.length === 0 && p.tasks.length === 0) {
        p.writing = true;
      }
    });

    return plans;
  } catch (e) {
    console.error("plan parse error", e);
    return [];
  }
}

function parseNotice(json) {
  try {
    const rows = json?.table?.rows ?? [];
    const notices = [];
    for (const row of rows) {
      const date = safeStr(row, 1);
      const order = safeStr(row, 2);
      const ch = safeStr(row, 3);
      const content = safeStr(row, 4);
      if (content && content !== "내용")
        notices.push({ date, order, ch, content });
    }
    return notices.slice(0, 2); // 최신 2개만
  } catch (e) {
    return [];
  }
}

// 공지 시트 전체 파싱 (날짜 / 순번 / 채널 / 내용 / 비고)
function parseNoticeAll(json) {
  try {
    const rows = json?.table?.rows ?? [];
    const items = [];
    for (const row of rows) {
      const date = safeStr(row, 1);
      const num = safeStr(row, 2);
      const channel = safeStr(row, 3);
      const content = safeStr(row, 4);
      const memo = safeStr(row, 5);
      // 헤더 행 스킵
      if (date === "날짜" || !content) continue;
      items.push({ date, num, channel, content, memo });
    }
    // 최신순 (역순)
    return items.reverse();
  } catch (e) {
    console.error("notice parse error", e);
    return [];
  }
}

// 짐 - 팀별 짐 시트 파싱
// 왼쪽 영역(A-G): 개인별 짐 (구분/이름/특이사항/위탁수화물/기내수화물)
// 오른쪽 영역(H-M): 사역팀 짐 (사역팀/물품명/수량/예상무게/비고)
// 아래쪽: 캐리어 수량 (사역팀별)
function parseLuggageTeam(json) {
  try {
    const rows = json?.table?.rows ?? [];
    const personal = []; // {num, name, note, checked, carryOn}
    const teamItems = []; // {team, item, qty, weight, memo}
    const carriers = []; // {team, count}

    let isCarrierSection = false;

    for (const row of rows) {
      // 왼쪽 영역 - 개인별 짐
      const num = safeStr(row, 0);
      const name = safeStr(row, 1);
      const note = safeStr(row, 2);
      const checked = safeStr(row, 3);
      const carryOn = safeStr(row, 5);

      // 캐리어 수량 섹션 시작 감지 ("사역팀" + "캐리어 수량")
      if (name === "사역팀" && note === "캐리어 수량") {
        isCarrierSection = true;
      } else if (isCarrierSection && name && name !== "사역팀") {
        carriers.push({ team: name, count: note || "-" });
      } else if (num && name && name !== "이름" && !isCarrierSection) {
        personal.push({ num, name, note, checked, carryOn });
      }

      // 오른쪽 영역 - 사역팀별 짐 (H~M열)
      const tNum = safeStr(row, 7);
      const team = safeStr(row, 8);
      const item = safeStr(row, 9);
      const qty = safeStr(row, 10);
      const weight = safeStr(row, 11);
      const memo = safeStr(row, 12);

      // 헤더 스킵, 빈 행 스킵
      if (team === "사역팀" || (!team && !item)) continue;
      if (item) teamItems.push({ team, item, qty, weight, memo });
    }

    return { personal, teamItems, carriers };
  } catch (e) {
    console.error("luggage team parse error", e);
    return { personal: [], teamItems: [], carriers: [] };
  }
}

// 짐 - 물품대여현황 시트 파싱
function parseLuggageRental(json) {
  try {
    const rows = json?.table?.rows ?? [];
    const items = [];
    for (const row of rows) {
      const num = safeStr(row, 0);
      const item = safeStr(row, 1);
      const qty = safeStr(row, 2);
      const owner = safeStr(row, 3);
      const memo = safeStr(row, 4);
      if (!item) continue;
      items.push({ num, item, qty, owner, memo });
    }
    return items;
  } catch (e) {
    console.error("luggage rental parse error", e);
    return [];
  }
}

/* ═══════════════════════════════════════════════
   5. 렌더러
═══════════════════════════════════════════════ */
function renderHomeScripture() {
  const el = document.getElementById("home-scripture");
  if (!el) return;
  el.innerHTML = `
    <p class="scripture-text">푯대를 향하여 그리스도 예수 안에서 하나님이 위에서 부르신 부름의 상을 위하여 달려가노라</p>
    <p class="scripture-ref"> 빌립보서 3:14</p>`;
  el.classList.add("fade-in");
}

function renderHomeOverview(result) {
  const el = document.getElementById("home-overview");
  if (!el) return;
  const d = result.ok ? parseOverview(result.data) : {};
  const rows = [
    { label: "기간", val: d.period || "2026.07.11 – 07.19 · 6박 8일" },
    { label: "장소", val: d.place || "카트만두 · 포카라" },
    { label: "인원", val: "28명" },
    { label: "출발", val: "2026.07.11 (토)" },
    { label: "귀국", val: "2026.07.19 (일)" },
  ];
  el.innerHTML = rows
    .map(
      (r, i) =>
        `<div class="row${i === rows.length - 1 ? ' style="padding-bottom:0;border-bottom:none"' : ""}">
      <span class="row-label">${escHtml(r.label)}</span>
      <span class="row-value">${escHtml(r.val)}</span>
    </div>`,
    )
    .join("");
  el.classList.add("fade-in");
}

function renderHomeNextMeeting() {
  const el = document.getElementById("home-next-meeting");
  if (!el) return;
  const { items } = parseSchedule(null);
  const today = kstNow();
  today.setHours(0, 0, 0, 0);
  const next = items.find((item) => {
    const d = new Date(item.date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  });
  if (!next) {
    el.innerHTML = `<div class="next-row"><div class="next-dot"></div><div class="next-info"><div class="next-label">예정된 모임이 없습니다</div></div></div>`;
    return;
  }
  const dd = kstDday(next.date);
  const df = fmtDate(next.date);
  const ddTxt = dd > 0 ? `D-${dd}` : dd === 0 ? "D-DAY" : "완료";
  const ddClass = dd === 0 ? "pill-red" : dd > 0 ? "pill-blue" : "pill-gray";
  el.innerHTML = `
    <div class="next-row">
      <div class="next-dot"></div>
      <div class="next-info">
        <div class="next-label">${escHtml(next.title)}</div>
        <div class="next-detail">${df.full}</div>
      </div>
      <span class="pill ${ddClass}">${ddTxt}</span>
    </div>`;
  el.classList.add("fade-in");
}

function renderHomeNotice(result) {
  const section = document.getElementById("home-notice-section");
  const list = document.getElementById("home-notice-list");
  if (!section || !list || !result.ok) return;
  const notices = parseNotice(result.data);
  if (notices.length === 0) return;
  section.style.display = "block";
  list.innerHTML = notices
    .map(
      (n) => `
    <div class="notice-card">
      <div class="notice-title">${escHtml(n.content)}</div>
      ${n.date ? `<div class="notice-date">${escHtml(n.date)}</div>` : ""}
    </div>`,
    )
    .join("");
}

function renderSchedule(result) {
  const listEl = document.getElementById("schedule-list");
  if (!listEl) return;

  // 일정 데이터 (전역 SCHEDULE_ITEMS 사용)
  const items = SCHEDULE_ITEMS;

  const pillMap = {
    team: "pill-blue",
    school: "pill-purple",
    special: "pill-green",
    after: "pill-red",
  };
  const labelMap = {
    team: "팀모임",
    school: "선교학교",
    special: "파송예배",
    after: "에프터",
  };

  const today = kstNow();
  today.setHours(0, 0, 0, 0);

  const itemsHtml = items.map((item) => {
    const d = new Date(item.date);
    const isPast = d < today;
    const mo = d.getMonth() + 1 + "월";
    const day = d.getDate();

    // 설명: detail + 장소 합치기 (구분점 없이 공백으로)
    const detailParts = [];
    if (item.detail) detailParts.push(escHtml(item.detail));
    if (item.place) detailParts.push(`<span class="sch-place">📍 ${escHtml(item.place)}</span>`);
    const detailHtml = detailParts.length > 0
      ? `<div class="sch-detail">${detailParts.join(" ")}</div>`
      : "";

    const badgesHtml = item.badges
      .map((b) => `<span class="pill ${pillMap[b] || "pill-gray"}">${labelMap[b] || b}</span>`)
      .join("");

    return `
      <div class="sch-item${isPast ? " past" : ""}">
        <div class="sch-date">
          <div class="sch-month">${mo}</div>
          <div class="sch-day">${day}</div>
          <div class="sch-wd">${item.day}</div>
        </div>
        <div class="sch-divider"></div>
        <div class="sch-content">
          <div class="sch-title">${escHtml(item.title)}</div>
          ${detailHtml}
          <div class="sch-badges">${badgesHtml}</div>
        </div>
      </div>`;
  }).join("");

  listEl.innerHTML = itemsHtml;
  listEl.classList.add("fade-in");
}

// 이름에서 기수 추출해서 "xx년대" 형식으로 변환
// "박지명(90)" → { name:"박지명", peer:"90년대" }
// "박지명" → { name:"박지명", peer:"" }
function parseName(str) {
  const m = String(str).match(/^(.+?)\((\d{2})\)$/);
  if (m) return { name: m[1].trim(), peer: m[2] + "년대" };
  return { name: String(str).trim(), peer: "" };
}

function nameTag(str) {
  const { name, peer } = parseName(str);
  return peer
    ? `${escHtml(name)}<span class="peer-tag">${escHtml(peer)}</span>`
    : escHtml(name);
}

function renderTeam(result) {
  const el = document.getElementById("team-content");
  if (!el) return;

  if (!result.ok) {
    el.innerHTML = `<div class="error-state"><p class="error-msg">팀 정보를 불러오지 못했습니다</p><button class="retry-btn" onclick="loadTeam()">다시 시도</button></div>`;
    return;
  }

  const org = parseOrg(result.data);

  // 조직도 — C 스타일 3레벨 (디렉터 → 부디렉터 → 전체팀장/회계/서기)
  const orgHtml = `
    <div class="section-label">조직도</div>
    <div class="card" style="padding: 20px; margin-bottom: 16px;">
      <div class="org-team-intro">
        <div class="org-team-top">
          <div class="org-team-badge">네팔 단기선교팀</div>
        </div>
        <div class="org-team-conn"></div>
        <div class="org-team-cards">
          <div class="org-team-card org-team-blue">
            <div class="org-team-card-title">생활조</div>
            <div class="org-team-card-desc">선교팀 안의 셀</div>
          </div>
          <div class="org-team-card org-team-green">
            <div class="org-team-card-title">JOB</div>
            <div class="org-team-card-desc">팀 안에서 담당하는 역할</div>
          </div>
          <div class="org-team-card org-team-orange">
            <div class="org-team-card-title">사역팀</div>
            <div class="org-team-card-desc">사역을 함께 준비하는 팀</div>
          </div>
        </div>
      </div>
    </div>
    <div class="card" style="padding:20px 16px; margin-top: 24px;">
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
          <div class="org-node lead">${escHtml(parseName(org.leaderM).name)}<small>팀장(남)</small></div>
          <div class="org-node lead">${escHtml(parseName(org.leaderF).name)}<small>팀장(여)</small></div>
          <div class="org-node lead">${escHtml(parseName(org.accountant).name)}<small>회계</small></div>
          <div class="org-node lead">${escHtml(parseName(org.secretary).name)}<small>서기</small></div>
        </div>
      </div>
    </div>`;

  // 사역팀 — 팀장 포함, 클릭 시 상세 사역 펼침
  const teamsHtml =
    org.teams.length > 0
      ? `
    <div class="section" style="margin-top: 36px;">
      <div class="section-label">사역팀</div>
      ${org.teams
        .map((t, ti) => {
          const meta = TEAM_META[t.name] || {
            icon: "⭐",
            color: "var(--blue)",
            bg: "var(--blue-bg)",
          };
          const detail = TEAM_DETAIL[t.name];
          const detailHtml = detail
            ? `
            <div class="team-detail" id="team-detail-${ti}">
              <div class="team-detail-inner">
              ${detail.meeting && detail.meeting.length > 0 ? `
                <div class="team-detail-sec">
                  <div class="team-detail-label">📋 선교 모임</div>
                  <ul class="team-detail-ul">
                    ${detail.meeting.map((m) => `<li>${escHtml(m)}</li>`).join("")}
                  </ul>
                </div>` : ""}
              ${detail.field && detail.field.length > 0 ? `
                <div class="team-detail-sec">
                  <div class="team-detail-label">✈️ 현지 선교</div>
                  <ul class="team-detail-ul">
                    ${detail.field.map((f) => `<li>${escHtml(f)}</li>`).join("")}
                  </ul>
                </div>` : ""}
              </div>
            </div>` : "";
          return `
          <div class="team-card">
            <div class="team-hd" ${detail ? `onclick="toggleTeamDetail(${ti})" style="cursor:pointer"` : ""}>
              <div class="team-icon" style="background:${meta.bg};color:${meta.color}">${meta.icon}</div>
              <div class="team-name">${escHtml(t.name)}</div>
              ${detail ? `<span class="team-chevron" id="team-chev-${ti}">▼</span>` : ""}
            </div>
            <div class="team-bd">
              <div class="chips">
                <span class="chip leader">${escHtml(parseName(t.leader).name)}</span>
                ${t.members.map((m) => `<span class="chip">${escHtml(parseName(m).name)}</span>`).join("")}
              </div>
            </div>
            ${detailHtml}
          </div>`;
        })
        .join("")}
    </div>`
      : "";

  // 생활조 — 이름 옆 또래 표시
  const lgHtml =
    org.lifeGroups.length > 0
      ? `
    <div class="section">
      <div class="section-label">생활조</div>
      <div class="lg-grid">
        ${org.lifeGroups
          .map(
            (g) => `
          <div class="lg-card">
            <div class="lg-num">${g.num}</div>
            <div class="lg-leader"> ${escHtml(parseName(g.leader).name)}</div>
            <div class="chips">
              ${g.members.map((m) => `<span class="chip">${escHtml(parseName(m).name)}</span>`).join("")}
            </div>
          </div>`,
          )
          .join("")}
      </div>
    </div>`
      : "";

  // JOB — 첫 번째 멤버가 리더 (이름 인디고 컬러), 클릭 시 역할 설명 펼침
  const jobHtml =
    org.jobs.length > 0
      ? `
    <div class="section" style="margin-bottom:0">
      <div class="section-label">JOB</div>
      <div class="card">
        ${org.jobs
          .map((j, ji) => {
            const meta = JOB_ICON[j.title] || { icon: "⭐", bg: "var(--bg)" };
            const desc = JOB_DETAIL[j.title];
            return `
            <div class="job-item ${desc ? "job-clickable" : ""}" ${desc ? `onclick="toggleJobDetail(${ji})"` : ""}>
              <div class="job-icon-box" style="background:${meta.bg}">${meta.icon}</div>
              <div class="job-content-wrap">
                <div class="job-title-row">
                  <div class="job-title">${escHtml(j.title)}</div>
                  ${desc ? `<span class="job-chevron" id="job-chev-${ji}">▼</span>` : ""}
                </div>
                <div class="job-members">${j.members
                  .map((m, i) => {
                    const name = escHtml(parseName(m).name);
                    return i === 0
                      ? `<span class="job-leader-name">${name}</span>`
                      : name;
                  })
                  .join(" · ")}</div>
                ${desc ? `<div class="job-detail" id="job-detail-${ji}"><p class="job-detail-text">${escHtml(desc)}</p></div>` : ""}
              </div>
            </div>`;
          })
          .join("")}
      </div>
    </div>`
      : "";

  el.innerHTML = orgHtml + teamsHtml + lgHtml + jobHtml;
  el.classList.add("fade-in");
}

// 사역팀 상세 펼치기/접기
function toggleTeamDetail(idx) {
  const detail = document.getElementById(`team-detail-${idx}`);
  const chev = document.getElementById(`team-chev-${idx}`);
  if (!detail) return;
  const isOpen = detail.classList.contains("open");
  if (isOpen) {
    detail.classList.remove("open");
    if (chev) chev.classList.remove("open");
  } else {
    detail.classList.add("open");
    if (chev) chev.classList.add("open");
  }
}

// JOB 역할 설명 펼치기/접기
function toggleJobDetail(idx) {
  const detail = document.getElementById(`job-detail-${idx}`);
  const chev = document.getElementById(`job-chev-${idx}`);
  if (!detail) return;
  const isOpen = detail.classList.contains("open");
  if (isOpen) {
    detail.classList.remove("open");
    if (chev) chev.classList.remove("open");
  } else {
    detail.classList.add("open");
    if (chev) chev.classList.add("open");
  }
}

function renderPlan(result) {
  const el = document.getElementById("plan-list");
  if (!el) return;

  if (!result.ok) {
    el.innerHTML = `<div class="error-state"><p class="error-msg">사역계획을 불러오지 못했습니다</p><button class="retry-btn" onclick="loadPlan()">다시 시도</button></div>`;
    return;
  }

  const plans = parsePlan(result.data);

  // 팀이 없으면 기본 6개 팀 표시
  const teamOrder = [
    "인터씨드팀",
    "하스피팀",
    "어린이사역팀",
    "문화사역팀",
    "빅아이디어팀",
    "예배팀",
  ];
  const finalPlans = teamOrder.map((name) => {
    const found = plans.find((p) => p.name === name);
    return (
      found || {
        name,
        writing: true,
        purpose: "",
        goals: [],
        tasks: [],
        rain: "",
      }
    );
  });

  const teamIcons = {
    인터씨드팀: "🙏",
    하스피팀: "🤝",
    어린이사역팀: "🌈",
    문화사역팀: "🎭",
    빅아이디어팀: "💡",
    예배팀: "🎵",
  };

  el.innerHTML = finalPlans
    .map((p, idx) => {
      const icon = teamIcons[p.name] || "⭐";
      const body = p.writing
        ? `<div class="plan-bd" id="plan-bd-${idx}" style="padding:20px;text-align:center"><span class="writing-pill">✏️ 작성 중</span></div>`
        : `<div class="plan-bd" id="plan-bd-${idx}">
          ${p.purpose ? `<div class="plan-sec"><div class="plan-sec-label">🎯 목적</div><p class="plan-purpose">${escHtml(p.purpose)}</p></div>` : ""}
          ${p.goals.length > 0 ? `<div class="plan-sec"><div class="plan-sec-label">📌 목표</div><ul class="plan-ul">${p.goals.map((g) => `<li>${escHtml(g)}</li>`).join("")}</ul></div>` : ""}
          ${p.tasks.length > 0 ? `<div class="plan-sec"><div class="plan-sec-label">✅ 실행과제</div><ul class="plan-ul">${p.tasks.map((t) => `<li>${escHtml(t)}</li>`).join("")}</ul></div>` : ""}
          ${p.rain ? `<div class="plan-sec"><div class="plan-sec-label">☔ 우천시 계획</div><div class="plan-rain">${escHtml(p.rain)}</div></div>` : ""}
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
    })
    .join("");

  el.classList.add("fade-in");
}

function renderAttendance(result) {
  const el = document.getElementById("att-content");
  if (!el) return;

  // fetch 실패해도 뼈대는 보여줌
  const { dates, members } = result.ok
    ? parseAttendance(result.data)
    : {
        dates: ATTENDANCE_DATES.map((d) => d.label),
        members: MEMBER_NAMES.map((name) => ({
          name,
          att: ATTENDANCE_DATES.map(() => 0),
        })),
      };

  // 지난 모임 수 계산 (오늘 기준으로 이미 지난 모임만)
  const today = kstNow();
  today.setHours(0, 0, 0, 0);
  const MEETING_FULL_DATES = [
    "2026-05-30", "2026-05-31", "2026-06-06", "2026-06-07",
    "2026-06-13", "2026-06-14", "2026-06-20", "2026-06-21",
    "2026-06-27", "2026-06-28", "2026-07-04", "2026-07-05",
  ];
  let pastCount = 0;
  MEETING_FULL_DATES.forEach((d) => {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    if (dt <= today) pastCount++;
  });

  // 통계: 평균 출석률 = 지난 모임 기준
  let totalAtt = 0;
  members.forEach((m) => {
    // 지난 모임까지만 합산
    for (let i = 0; i < pastCount; i++) {
      totalAtt += m.att[i] || 0;
    }
  });
  const possiblePast = members.length * pastCount;
  const rate = possiblePast > 0 ? Math.round((totalAtt / possiblePast) * 100) : 0;

  const totalEl = document.getElementById("att-total");
  const rateEl = document.getElementById("att-rate");
  const countEl = document.getElementById("att-count");
  if (totalEl) totalEl.textContent = members.length;
  if (rateEl) rateEl.textContent = rate + "%";
  if (countEl) countEl.textContent = dates.length;

  // B안: 팀원별 요약 카드 + 펼치기
  const cards = members
    .map((m, idx) => {
      const count = m.att.reduce((a, b) => a + b, 0);

      // 펼쳐지는 날짜별 점
      const dots = m.att
        .map((v, di) => {
          const d = ATTENDANCE_DATES[di];
          return `
          <div class="att-dot-item">
            <span class="att-dot ${v === 1 ? "on" : "off"}"></span>
            <span class="att-dot-date">${escHtml(d.label)}</span>
          </div>`;
        })
        .join("");

      return `
      <div class="att-member-card" onclick="toggleAttMember(${idx})">
        <div class="att-member-head">
          <span class="att-member-name">${escHtml(m.name)}</span>
          <div class="att-member-right">
            <span class="att-member-count">${count}<span class="att-member-total">/${dates.length}</span></span>
            <span class="att-member-chevron" id="att-chev-${idx}">▼</span>
          </div>
        </div>
        <div class="att-member-detail" id="att-detail-${idx}">
          <div class="att-dot-grid">${dots}</div>
        </div>
      </div>`;
    })
    .join("");

  el.innerHTML = `<div class="att-member-list">${cards}</div>`;
  el.classList.add("fade-in");
}

// 출석 팀원 카드 펼치기/접기
function toggleAttMember(idx) {
  const detail = document.getElementById(`att-detail-${idx}`);
  const chev = document.getElementById(`att-chev-${idx}`);
  if (!detail) return;
  const isOpen = detail.classList.contains("open");
  if (isOpen) {
    detail.classList.remove("open");
    if (chev) chev.classList.remove("open");
  } else {
    detail.classList.add("open");
    if (chev) chev.classList.add("open");
  }
}


/* ═══════════════════════════════════════════════
   5-1. 공지 / 짐 렌더러
═══════════════════════════════════════════════ */
function renderNotice(result) {
  const el = document.getElementById("notice-list");
  if (!el) return;

  if (!result.ok) {
    el.innerHTML = `<div class="error-state"><p class="error-msg">공지사항을 불러오지 못했습니다</p><button class="retry-btn" onclick="loadNotice()">다시 시도</button></div>`;
    return;
  }

  const items = parseNoticeAll(result.data);

  if (items.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📢</div>
        <p class="empty-title">아직 공지가 없어요</p>
        <p class="empty-desc">새로운 공지가 올라오면<br/>여기에 표시됩니다</p>
      </div>`;
    return;
  }

  el.innerHTML = items
    .map((n) => `
      <div class="notice-card">
        <div class="notice-meta">
          ${n.date ? `<span class="notice-date">${escHtml(n.date)}</span>` : ""}
          ${n.channel ? `<span class="notice-channel">${escHtml(n.channel)}</span>` : ""}
        </div>
        <div class="notice-content">${escHtml(n.content)}</div>
        ${n.memo ? `<div class="notice-memo">${escHtml(n.memo)}</div>` : ""}
      </div>
    `)
    .join("");
}

function renderLuggage(teamResult, rentalResult) {
  // 팀별 짐
  const teamData = teamResult.ok ? parseLuggageTeam(teamResult.data) : { personal: [], teamItems: [], carriers: [] };
  const rentalData = rentalResult.ok ? parseLuggageRental(rentalResult.data) : [];

  // 1) 개인 짐
  const personalEl = document.getElementById("lug-personal-list");
  if (personalEl) {
    if (!teamResult.ok) {
      personalEl.innerHTML = `<div class="error-state"><p class="error-msg">개인 짐 목록을 불러오지 못했습니다</p><button class="retry-btn" onclick="loadLuggage()">다시 시도</button></div>`;
    } else if (teamData.personal.length === 0) {
      personalEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎒</div>
          <p class="empty-title">아직 개인 짐 정보가 없어요</p>
          <p class="empty-desc">각자 짐 정보가 입력되면<br/>여기에 표시됩니다</p>
        </div>`;
    } else {
      personalEl.innerHTML = teamData.personal
        .map((p) => `
          <div class="lug-person-card">
            <div class="lug-person-head">
              <span class="lug-person-num">${escHtml(p.num)}</span>
              <span class="lug-person-name">${escHtml(p.name)}</span>
              ${p.note ? `<span class="lug-person-note">${escHtml(p.note)}</span>` : ""}
            </div>
            <div class="lug-person-body">
              <div class="lug-row">
                <span class="lug-label">위탁수화물</span>
                <span class="lug-val">${p.checked ? escHtml(p.checked) : "<span class='lug-empty'>—</span>"}</span>
              </div>
              <div class="lug-row">
                <span class="lug-label">기내수화물</span>
                <span class="lug-val">${p.carryOn ? escHtml(p.carryOn) : "<span class='lug-empty'>—</span>"}</span>
              </div>
            </div>
          </div>
        `)
        .join("");
    }
  }

  // 2) 팀별 짐
  const teamEl = document.getElementById("lug-team-list");
  if (teamEl) {
    if (!teamResult.ok) {
      teamEl.innerHTML = `<div class="error-state"><p class="error-msg">팀별 짐 목록을 불러오지 못했습니다</p><button class="retry-btn" onclick="loadLuggage()">다시 시도</button></div>`;
    } else {
      // 사역팀별로 그룹화
      const grouped = {};
      teamData.teamItems.forEach((it) => {
        const team = it.team || "기타";
        if (!grouped[team]) grouped[team] = [];
        grouped[team].push(it);
      });

      // 캐리어 수량 카드
      const carrierHtml = teamData.carriers.length > 0
        ? `
        <div class="card lug-carrier-card">
          <div class="lug-carrier-title">🧳 캐리어 수량</div>
          <div class="lug-carrier-list">
            ${teamData.carriers.map((c) => `
              <div class="lug-carrier-row">
                <span class="lug-carrier-team">${escHtml(c.team)}</span>
                <span class="lug-carrier-count">${escHtml(c.count)}</span>
              </div>
            `).join("")}
          </div>
        </div>` : "";

      const teamGroupsHtml = Object.keys(grouped).length === 0
        ? `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <p class="empty-title">아직 팀별 짐 정보가 없어요</p>
          <p class="empty-desc">사역팀별 짐 목록이 입력되면<br/>여기에 표시됩니다</p>
        </div>`
        : Object.entries(grouped).map(([team, items]) => {
            const meta = TEAM_META[team] || { icon: "📦", color: "var(--t2)", bg: "var(--bg2)" };
            return `
            <div class="card lug-team-card" style="border-color: ${meta.color}">
              <div class="lug-team-head" style="background: ${meta.bg}">
                <span class="lug-team-icon">${meta.icon}</span>
                <span class="lug-team-name" style="color: ${meta.color}">${escHtml(team)}</span>
                <span class="lug-team-count">${items.length}개</span>
              </div>
              <div class="lug-team-items">
                ${items.map((it) => `
                  <div class="lug-item-row">
                    <span class="lug-item-name">${escHtml(it.item)}</span>
                    <div class="lug-item-meta">
                      ${it.qty ? `<span class="lug-item-qty">${escHtml(it.qty)}</span>` : ""}
                      ${it.weight ? `<span class="lug-item-weight">${escHtml(it.weight)}</span>` : ""}
                    </div>
                    ${it.memo ? `<div class="lug-item-memo">${escHtml(it.memo)}</div>` : ""}
                  </div>
                `).join("")}
              </div>
            </div>
          `;
          }).join("");

      teamEl.innerHTML = carrierHtml + teamGroupsHtml;
    }
  }

  // 3) 물품대여현황
  const rentalEl = document.getElementById("lug-rental-list");
  if (rentalEl) {
    if (!rentalResult.ok) {
      rentalEl.innerHTML = `<div class="error-state"><p class="error-msg">물품대여 정보를 불러오지 못했습니다</p><button class="retry-btn" onclick="loadLuggage()">다시 시도</button></div>`;
    } else if (rentalData.length === 0) {
      rentalEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🎹</div>
          <p class="empty-title">아직 대여 물품이 없어요</p>
          <p class="empty-desc">대여 물품이 등록되면<br/>여기에 표시됩니다</p>
        </div>`;
    } else {
      rentalEl.innerHTML = rentalData
        .map((it) => `
          <div class="card lug-rental-card">
            <div class="lug-rental-head">
              <span class="lug-rental-num">${escHtml(it.num)}</span>
              <span class="lug-rental-item">${escHtml(it.item)}</span>
              ${it.qty ? `<span class="lug-rental-qty">${escHtml(it.qty)}</span>` : ""}
            </div>
            ${it.owner || it.memo ? `
              <div class="lug-rental-body">
                ${it.owner ? `<div class="lug-row"><span class="lug-label">책임자</span><span class="lug-val">${escHtml(it.owner)}</span></div>` : ""}
                ${it.memo ? `<div class="lug-row"><span class="lug-label">비고</span><span class="lug-val">${escHtml(it.memo)}</span></div>` : ""}
              </div>` : ""}
          </div>
        `)
        .join("");
    }
  }
}

/* ═══════════════════════════════════════════════
   6. 로드 함수
═══════════════════════════════════════════════ */
async function loadHome() {
  renderHomeScripture();
  renderNextMeeting();
  const noticeResult = await fetchSheetSafe(SHEETS.notice);
  renderHomeNotice(noticeResult);
}

// 홈 - 다음 모임 카드 (오늘 기준 가장 가까운 미래 일정)
function renderNextMeeting() {
  const dateEl = document.getElementById("next-meeting-date");
  const titleEl = document.getElementById("next-meeting-title");
  const placeEl = document.getElementById("next-meeting-place");
  const cardEl = document.getElementById("next-meeting-card");
  if (!dateEl || !titleEl || !cardEl) return;

  const today = kstNow();
  today.setHours(0, 0, 0, 0);

  // 오늘 포함 이후의 가장 가까운 일정 찾기
  const next = SCHEDULE_ITEMS.find((item) => {
    const d = new Date(item.date);
    d.setHours(0, 0, 0, 0);
    return d >= today;
  });

  if (!next) {
    // 모든 일정 종료
    dateEl.textContent = "";
    titleEl.textContent = "모든 일정이 마무리되었어요";
    if (placeEl) placeEl.textContent = "";
    return;
  }

  const d = new Date(next.date);
  const mo = d.getMonth() + 1;
  const day = d.getDate();
  dateEl.textContent = `${mo}/${day} (${next.day})`;
  titleEl.textContent = next.title;
  if (placeEl) {
    placeEl.innerHTML = next.place ? `📍 ${escHtml(next.place)}` : "";
  }
}

async function loadSchedule() {
  // 일정은 하드코딩 - fetch 없이 바로 렌더
  renderSchedule({ ok: true, data: null, offline: false });
}

async function loadTeam() {
  // 조직도는 하드코딩이라 fetch 없이 바로 렌더
  renderTeam({ ok: true, data: null, offline: false });
}

async function loadPlan() {
  const result = await fetchSheetSafe(SHEETS.plan);
  renderPlan(result);
}

async function loadAttendance() {
  const result = await fetchSheetSafe(SHEETS.attendance);
  renderAttendance(result);
}

async function loadNotice() {
  const result = await fetchSheetSafe(SHEETS.notice);
  renderNotice(result);
}

async function loadLuggage() {
  const [teamResult, rentalResult] = await Promise.all([
    fetchSheetSafe(SHEETS.luggageTeam),
    fetchSheetSafe(SHEETS.luggageRental),
  ]);
  renderLuggage(teamResult, rentalResult);
}

/* ═══════════════════════════════════════════════
   7. 날씨
═══════════════════════════════════════════════ */
async function loadWeather() {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current=temperature_2m,weathercode&timezone=Asia%2FKathmandu",
    );
    const data = await res.json();
    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weathercode;
    const desc =
      code <= 1
        ? "맑음"
        : code <= 3
          ? "구름 조금"
          : code <= 48
            ? "안개"
            : code <= 67
              ? "비"
              : code <= 77
                ? "눈"
                : code <= 82
                  ? "소나기"
                  : "뇌우";
    const tempEl = document.getElementById("w-temp");
    const descEl = document.getElementById("w-desc");
    if (tempEl) tempEl.textContent = temp;
    if (descEl) descEl.textContent = desc;
  } catch (e) {
    const descEl = document.getElementById("w-desc");
    if (descEl) descEl.textContent = "정보 없음";
  }
}

function loadLiveDday() {
  const dep = kstDday(DEPARTURE_DATE);
  const valEl = document.getElementById("dday-val");
  const unitEl = document.getElementById("dday-unit");
  const subEl = document.getElementById("dday-sub");
  if (!valEl) return;
  if (dep > 0) {
    valEl.textContent = dep;
    unitEl.textContent = "일";
    subEl.textContent = "D-" + dep;
  } else if (dep === 0) {
    valEl.textContent = "DAY";
    unitEl.textContent = "";
    subEl.textContent = "오늘 출발!";
  } else {
    valEl.textContent = Math.abs(dep);
    unitEl.textContent = "일째";
    subEl.textContent = "선교 중 🙏";
  }
}

function startKtmClock() {
  function tick() {
    const el = document.getElementById("ktm-time");
    if (!el) return;
    const now = new Date();
    const ktm = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kathmandu" }));
    const h = String(ktm.getHours()).padStart(2, "0");
    const m = String(ktm.getMinutes()).padStart(2, "0");
    const s = String(ktm.getSeconds()).padStart(2, "0");
    el.textContent = `${h}:${m}:${s}`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════════
   8. D-day
═══════════════════════════════════════════════ */
function updateDday() {
  const dep = kstDday(DEPARTURE_DATE);
  const depEl = document.getElementById("dday-dep");
  const unitEl = document.getElementById("dday-dep-unit");
  const kvDdEl = document.getElementById("kv-dday");

  if (!depEl) return;
  if (dep > 0) {
    depEl.textContent = dep;
    if (unitEl) unitEl.textContent = "일 남음";
    if (kvDdEl) kvDdEl.textContent = `D-${dep}`;
  } else if (dep === 0) {
    depEl.textContent = "D-DAY";
    if (unitEl) unitEl.textContent = "오늘 출발!";
    if (kvDdEl) kvDdEl.textContent = "D-DAY";
  } else {
    depEl.textContent = Math.abs(dep);
    if (unitEl) unitEl.textContent = "일째 선교 중";
    if (kvDdEl) kvDdEl.textContent = "선교 중";
  }
}

/* ═══════════════════════════════════════════════
   9. 히어로 초기화 (단순 D-day 표시)
═══════════════════════════════════════════════ */
function initPressOn() {
  // 히어로 바로 표시 — 별도 인터랙션 없음
}

function openKV() {
  const home = document.getElementById("homeView");
  const wrap = document.getElementById("kvOverlay");
  const inner = document.getElementById("kvInner");
  const pressEl = document.getElementById("pressOn");
  const dimEl = document.querySelector(".dim-overlay");
  if (pressEl) pressEl.classList.remove("pressing");
  if (dimEl) dimEl.classList.remove("active");
  if (home) {
    home.style.opacity = "0";
    home.style.transition = "opacity .2s";
  }
  setTimeout(() => {
    if (home) home.style.display = "none";
    if (wrap) wrap.style.display = "block";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (inner) inner.classList.add("show");
      }),
    );
  }, 200);
}

function closeKV() {
  const home = document.getElementById("homeView");
  const wrap = document.getElementById("kvOverlay");
  const inner = document.getElementById("kvInner");
  if (inner) inner.classList.remove("show");
  setTimeout(() => {
    if (wrap) wrap.style.display = "none";
    if (home) {
      home.style.display = "block";
      home.style.opacity = "0";
    }
    requestAnimationFrame(() => {
      if (home) home.style.opacity = "1";
    });
  }, 300);
}

/* ═══════════════════════════════════════════════
   10. 아코디언 + NEPAL 말씀 팝업
═══════════════════════════════════════════════ */
const NEPAL_DATA = {
  N: {
    word: "New Creation",
    desc: "복음을 통해 새롭게 변화됨을 믿는다",
    ref: "고린도후서 5:17",
    verse:
      "그런즉 누구든지 그리스도 안에 있으면 새로운 피조물이라. 이전 것은 지나갔으니 보라 새것이 되었도다.",
  },
  E: {
    word: "Evangelism",
    desc: "복음을 전하는 게 선교의 사명이다",
    ref: "마가복음 16:15",
    verse: "또 이르시되 너희는 온 천하에 다니며 만민에게 복음을 전파하라.",
  },
  P: {
    word: "Passion for Worship",
    desc: "더 순전한 마음을 구하며 예배한다",
    ref: "요한복음 4:23-24",
    verse:
      "아버지께서는 이렇게 자기에게 예배하는 자들을 찾으시느니라. 하나님은 영이시니 예배하는 자가 영과 진리로 예배할지니라.",
  },
  A: {
    word: "Agape",
    desc: "하나님의 사랑 안에 거한다",
    ref: "요한복음 15:9",
    verse:
      "아버지께서 나를 사랑하신 것 같이 나도 너희를 사랑하였으니 나의 사랑 안에 거하라.",
  },
  L: {
    word: "Love and Serve",
    desc: "혼자가 아니라 팀이 함께 지어져 간다",
    ref: "에베소서 2:22",
    verse:
      "너희도 성령 안에서 하나님이 거하실 처소가 되기 위하여 그리스도 예수 안에서 함께 지어져 가느니라.",
  },
};

function openNepal(letter) {
  const data = NEPAL_DATA[letter];
  if (!data) return;

  document.getElementById("ndLetter").textContent = letter;
  document.getElementById("ndWord").textContent = data.word;
  document.getElementById("ndDesc").textContent = data.desc;
  document.getElementById("ndVerse").innerHTML =
    `${escHtml(data.verse)}<div style="font-size:12px;color:var(--pri);margin-top:10px;font-weight:600;">${escHtml(data.ref)}</div>`;

  const overlay = document.getElementById("nepalOverlay");
  overlay.classList.add("open");
}

function closeNepal() {
  const overlay = document.getElementById("nepalOverlay");
  overlay.classList.remove("open");
}
function toggleNepalDay(idx) {
  const acc = document.getElementById(`nday-${idx}`);
  const chev = document.getElementById(`nchev-${idx}`);
  if (!acc) return;
  const isOpen = acc.classList.contains("open");
  acc.classList.toggle("open", !isOpen);
  if (chev) chev.classList.toggle("open", !isOpen);
}

function togglePlan(idx) {
  const bd = document.getElementById(`plan-bd-${idx}`);
  const arrow = document.getElementById(`plan-arrow-${idx}`);
  if (!bd) return;
  const isOpen = bd.classList.contains("open");
  bd.classList.toggle("open", !isOpen);
  if (arrow) arrow.classList.toggle("open", !isOpen);
}

function toggleStory(idx) {
  const bd = document.getElementById(`story-bd-${idx}`);
  const arrow = document.getElementById(`story-arrow-${idx}`);
  if (!bd) return;
  const isOpen = bd.classList.contains("open");
  bd.classList.toggle("open", !isOpen);
  if (arrow) arrow.classList.toggle("open", !isOpen);
}

// 기도편지 원문 이미지 모달
function openLetterImg(src) {
  const modal = document.getElementById("letter-modal");
  const img = document.getElementById("letter-modal-img");
  const save = document.getElementById("letter-modal-save");
  if (!modal || !img) return;
  img.src = src;
  if (save) {
    save.href = src;
    const fname = src.split("/").pop();
    save.setAttribute("download", fname || "기도편지.png");
  }
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLetterImg() {
  const modal = document.getElementById("letter-modal");
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
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
  document.getElementById("navMenu").classList.add("open");
  document.getElementById("hamburgerBtn").classList.add("open");
  document.getElementById("contentDim").classList.add("on");
}

function closeMenu() {
  menuOpen = false;
  document.getElementById("navMenu").classList.remove("open");
  document.getElementById("hamburgerBtn").classList.remove("open");
  document.getElementById("contentDim").classList.remove("on");
}

const STALE_TIME = 30 * 1000; // 30초
const lastFetched = {};

function loadIfStale(id, loadFn) {
  const now = Date.now();
  const last = lastFetched[id] || 0;
  if (now - last > STALE_TIME) {
    lastFetched[id] = now;
    loadFn();
  }
}

// 강제 새로고침 (캐시 무시하고 즉시 fetch)
const refreshLoaders = {
  attendance: loadAttendance,
  plan: loadPlan,
  notice: loadNotice,
  luggage: loadLuggage,
};

async function refreshData(id) {
  const btn = document.querySelector(`#${id}-refresh-text`)?.closest(".refresh-btn");
  const icon = btn?.querySelector(".refresh-icon");
  if (icon) icon.classList.add("spinning");

  lastFetched[id] = Date.now();
  const loadFn = refreshLoaders[id];
  if (loadFn) await loadFn();

  const textEl = document.getElementById(`${id}-refresh-text`);
  if (textEl) textEl.textContent = "방금 업데이트됨";

  setTimeout(() => {
    if (icon) icon.classList.remove("spinning");
  }, 600);
}

function showPage(id) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".drawer-item")
    .forEach((b) => b.classList.remove("active"));
  const page = document.getElementById("page-" + id);
  const btn = document.querySelector(`.drawer-item[data-page="${id}"]`);
  if (page) page.classList.add("active");
  if (btn) btn.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  closeMenu();

  // URL hash 처리: 홈은 hash 없이 깔끔하게, 다른 탭은 hash 유지
  if (id === "home") {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  } else {
    history.replaceState(null, "", "#" + id);
  }

  // 홈 진입 시 히어로 초기화
  if (id === "home") initPressOn();

  if (!loaded.has(id)) {
    loaded.add(id);
    if (id === "schedule") loadSchedule();
    if (id === "team") loadTeam();
  }
  // 출석/사역계획/짐/공지는 30초 캐시 전략
  if (id === "plan") loadIfStale("plan", loadPlan);
  if (id === "attendance") loadIfStale("attendance", loadAttendance);
  if (id === "notice") loadIfStale("notice", loadNotice);
  if (id === "luggage") loadIfStale("luggage", loadLuggage);
}

document.querySelectorAll(".drawer-item").forEach((btn) => {
  btn.addEventListener("click", () => showPage(btn.dataset.page));
});

// 서브탭 (일정)
document.querySelectorAll("#page-schedule .sub-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll("#page-schedule .sub-tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll("#page-schedule .sub-page")
      .forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    const sub = document.getElementById("sub-" + btn.dataset.sub);
    if (sub) sub.classList.add("active");
  });
});

// 서브탭 (짐)
document.querySelectorAll("#page-luggage .sub-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll("#page-luggage .sub-tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll("#page-luggage .sub-page")
      .forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    const sub = document.getElementById("lug-" + btn.dataset.luggageSub);
    if (sub) sub.classList.add("active");
  });
});

/* ═══════════════════════════════════════════════
   12. 새로고침
═══════════════════════════════════════════════ */
async function refreshAll() {
  await Promise.all([loadHome(), loadWeather()]);
  const activeId = document
    .querySelector(".page.active")
    ?.id?.replace("page-", "");
  if (activeId === "schedule") await loadSchedule();
  if (activeId === "team") await loadTeam();
  if (activeId === "plan") await loadPlan();
  if (activeId === "attendance") await loadAttendance();
  if (activeId === "notice") await loadNotice();
  if (activeId === "luggage") await loadLuggage();
}

/* ═══════════════════════════════════════════════
   13. 스크롤 TOP 버튼
═══════════════════════════════════════════════ */
window.addEventListener("scroll", () => {
  const btn = document.getElementById("scroll-top");
  if (btn) btn.classList.toggle("visible", window.scrollY > 160);
});

/* ═══════════════════════════════════════════════
   14. visibilitychange 재fetch
═══════════════════════════════════════════════ */
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") refreshAll();
});

/* ═══════════════════════════════════════════════
   15. 초기화
═══════════════════════════════════════════════ */
async function init() {
  updateDday();
  initPressOn();
  initRevealObserver();
  loadLiveDday();
  startKtmClock();
  loaded.add("home");

  // 히어로 벗어나면 화살표 숨기기
  const hint = document.querySelector(".hero-scroll-hint");
  const hero = document.querySelector(".home-hero-full");
  if (hint && hero) {
    window.addEventListener("scroll", () => {
      const heroBottom = hero.getBoundingClientRect().bottom;
      if (heroBottom <= 0) {
        hint.classList.add("hidden");
      } else {
        hint.classList.remove("hidden");
      }
    }, { passive: true });
  }

  await Promise.all([loadHome(), loadWeather()]);

  // fallback: 3초 후에도 안 뜬 reveal 요소 강제 표시
  setTimeout(() => {
    document.querySelectorAll(
      "#page-home .reveal-item:not(.revealed), #page-home .stagger-item:not(.revealed)"
    ).forEach(el => el.classList.add("revealed"));
  }, 3000);

  // 초기 로드 시 hash 있으면 해당 탭으로 이동
  const hash = location.hash.replace("#", "");
  const validPages = ["home", "overview", "schedule", "team", "plan", "attendance", "story", "luggage", "notice"];
  if (hash && validPages.includes(hash)) {
    showPage(hash);
  }
}

init();

/* ═══════════════════════════════════════════════
   16. 스크롤 유도 버튼 액션
═══════════════════════════════════════════════ */
function loadVideo() {
  const wrap = document.getElementById("video-placeholder");
  if (!wrap) return;
  wrap.innerHTML = `<iframe
    src="https://www.youtube.com/embed/Go3qHZosLuY?autoplay=1"
    title="네팔 선교 영상"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>`;
}

function scrollToScripture() {
  const targetSection = document.getElementById("scripture-section");
  if (targetSection) {
    const navHeight = 54;
    const heroOverlap = 72; // 히어로 하단이 살짝 걸치도록
    const targetPosition =
      targetSection.getBoundingClientRect().top +
      window.scrollY -
      navHeight -
      heroOverlap;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }
}

/* ═══ Reveal Observer (홈 콘텐츠 진입 애니메이션) ═══ */
function initRevealObserver() {
  const targets = document.querySelectorAll(
    "#page-home .reveal-item, #page-home .stagger-item"
  );
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0,
      rootMargin: "0px 0px 0px 0px",
    }
  );

  targets.forEach((el) => observer.observe(el));
}
