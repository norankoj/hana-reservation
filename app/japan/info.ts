// 일본 집회 안내 페이지(/japan)의 문구·날짜·링크는 전부 여기서만 고칩니다.
// 값이 "" 이면 페이지에서 그 줄이 숨겨지거나 "추후 공지"로 보입니다.
// **이렇게** 감싼 부분은 굵게 강조됩니다.
export const info = {
  title: "Promised Land Japan in Oita",
  shareDescription: "11/20(금) ~ 11/22(주일) 오이타 집회 참가 안내 · 일정, 준비물, 스태프 모집",
  dates: "2026년 11월 20일(금) ~ 22일(주일)",
  startDate: "2026-11-20", // D-day 기준
  endDate: "2026-11-22",

  // 소개: 굵은 큰 제목 아래 본문 (전부 굵게, 형광펜 없음)
  intro: [
    "한국더비교회뿐 아니라 일본교회, 몽골교회 등 다양한 글로벌 교회가 함께하는 자리이며, 1,000명 이상의 참가자가 모일 예정입니다.",
    "일본 땅 가운데 하나님께서 행하실 일을 기대하며 기도로 준비해 주세요.",
    "이번 집회는 개인 여행이 아니라 함께 예배하고 기도하는 선교의 자리입니다. 단기선교를 준비하는 마음으로 참여해 주시고, 집회에 집중할 수 있도록 개인 일정이나 개별 활동은 자제해 주세요.",
  ],

  // 메뉴 위 새 공지 한 줄 (text 를 "" 로 두면 숨김). href 는 누르면 펼쳐질 메뉴
  news: { text: "출국 안내와 비짓재팬 등록 방법이 올라왔어요", href: "#depart" },

  // 일정 (세로 타임라인). notes 에 notes.ts 의 키를 넣으면 "모임 내용 보기" 버튼이 생깁니다.
  // until 은 그 일정이 끝나는 날: 지나면 기도모임 칸의 "다음 일정" 카드가 다음 것으로 바뀝니다.
  // 카드는 poster·when·sub 가 있는 일정(기도모임)만 나옵니다.
  timeline: [
    { until: "2026-11-07", date: "11/7(토)", title: "준비 기도모임", desc: "오후 10시 · NGC 강당", notes: "1107", when: "11/7(토) 오후 10시", sub: "NGC 강당 · 11/14(토)에도 있어요", poster: "/japan/prayer.webp" },
    { until: "2026-11-14", date: "11/14(토)", title: "준비 기도모임", desc: "오후 10시 · NGC 강당", when: "11/14(토) 오후 10시", sub: "NGC 강당", poster: "/japan/prayer.webp" },
    { until: "2026-11-19", date: "11/19(목)", title: "단체 출국", desc: "교육관 7:45 집합 · ZE647 12:25 이륙 · 저녁 숙소 도착" },
    { until: "2026-11-22", date: "11/20(금) ~ 22(주일)", title: "집회", desc: "Promised Land Japan in Oita", main: true },
    { until: "2026-11-23", date: "11/23(월)", title: "단체 귀국", desc: "" },
  ],

  // 단체 항공편 (출국 안내·비짓재팬 안내에 같이 쓰임)
  flights: [
    { label: "출국", date: "2026.11.19(목)", flight: "ZE647", time: "12:25", arrive: "14:00", from: "인천국제공항(ICN)", to: "후쿠오카국제공항(FUK)" },
    { label: "귀국", date: "2026.11.23(월)", flight: "ZE648", time: "15:20", arrive: "16:30", from: "후쿠오카국제공항(FUK)", to: "인천국제공항(ICN)" },
  ],

  // 출국 안내: 단체 버스 집합, 수하물, 조 편성
  // 출국 안내 표: [굵은 첫 줄, 작은 둘째 줄]
  localMove: ["후쿠오카 ↔ 벳부 단체 버스", "조별(셀 단위)로 이동해요. 개별 행동은 자제해 주세요."],
  soloMove: ["항공편·현지 이동 일정을 미리 확인", "팀 담당자는 팀원의 위치와 이동 상황을 파악하고, 긴급 상황에 대비해 주세요."],
  boardNote: "자세한 일정은 게시판에서 확인해 주세요.",
  departBus: ["11/19(목) 오전 7:45 교육관 주차장 집합", "8:00 출발 · 교육관 주차장에는 개인 차량을 주차할 수 없어요."],
  luggage: ["기내 10kg · 위탁 15kg", "버스로 다 함께 이동하고 시간이 촉박해서 기내 수하물로 통일합니다. 위탁은 특별한 사정이 있는 분만 (스태프 물품, 예배팀 악기 등)"],
  luggageLink: "https://www.eastarjet.com/newstar/PGWIK00001", // 이스타항공(ZE) 수하물 규정
  teams: "", // 조 편성. 비어 있으면 "추후 공지"

  // 비짓재팬(Visit Japan Web) 등록 안내: 단체 숙소 주소 (복사 버튼)
  visitJapanText: "비짓재팬은 **개인적으로 등록**해 주세요. 항공편명만 넣으면 됩니다. 단체 항공·단체 숙소는 아래 내용을 그대로 적어 주세요.",
  visitJapanLink: "https://services.digital.go.jp/ko/visit-japan-web/",
  visitJapanGuide: "https://m.blog.naver.com/tnwlsdl702/224266947516", // 작성 방법 참고 블로그
  lodging: [
    { who: "형제", address: "〒874-0920 Oita, Beppu, Kitahama, 3 Chome−10−2 別府タワー 3F・5F" },
    { who: "자매", address: "1-25 Minamimatogahama-cho Beppu-shi Oita" },
    { who: "사역자", address: "5-31 Minamimatogahamacho, Beppu, Oita 874-0929" },
  ],

  // 문의사항 (자주 묻는 질문)
  faq: [
    { q: "이티켓(전자항공권)을 따로 받나요?", a: "따로 이티켓은 없습니다. 대신 **단체 확인증**이 있습니다." },
    { q: "비짓재팬은 어떻게 등록하나요?", a: "**개인적으로 등록**해 주세요. 항공편명만 넣으면 됩니다. 단체 항공편과 숙소 주소는 위 **비짓재팬 등록** 칸에 있어요." },
  ],

  // 버스·팀 담당자 신청 마감 (이 날까지 신청 가능. 신청 페이지와 supabase/japan.sql 정책도 같은 날짜)
  formDeadline: "2026-11-08",

  // 인천공항행 버스 (단체·개별 항공 누구나 신청)
  busText: "인천공항행 버스가 준비되어 있습니다. 단체·개별 항공 상관없이 원하시는 분은 누구나 신청해 주세요.",
  // 버스 안내 아래 작은 글씨. **이렇게** 감싼 부분은 형광펜 없이 굵게만
  busNotes: ["교육관 주차장에는 **개인 차량을 주차할 수 없어요.**", "최종 탑승 가능 여부는 신청 인원에 따라 달라질 수 있으며, 단체 항공 신청자만 이용 가능할 수 있는 점 양해 부탁드립니다."],
  busLink: "/japan/bus",
  busDeadline: "11/8(주일)",
  busLegs: [
    { label: "가는 편", date: "11/19(목)", time: "오전 8시", note: "교육관 주차장 7:45 집합 · 8:00 출발 (예상)" },
    { label: "오는 편", date: "11/23(월)", time: "오후 5시", note: "인천공항에서 출발 (예상)" },
  ],
  busFare: "", // 편도/왕복 차비. 비어 있으면 "추후 공지"

  // 도착 후 일정 (목·금). items 는 번호 목록, notes 는 아래 작은 안내
  arrival: [
    {
      day: "11/19(목)",
      title: "숙소 도착",
      items: ["숙소 도착 후 짐 정리 및 개인 정비", "조별 저녁 식사 (공항조)", "다음 일정 준비 및 휴식"],
      notes: [
        "충분한 휴식과 다음날 집회를 위해 되도록 **밤 11시에는 취침**해 주세요.",
        "외부 이동이 필요한 경우에는 가급적 **조원들과 함께** 이동해 주세요.",
      ],
    },
    {
      day: "11/20(금)",
      title: "조별 일정",
      items: [
        "단체팀과 개별적으로 일찍 도착하는 인원을 확인해 조를 편성할 예정입니다.",
        "조별 활동: 오이타 교회 기도의 집 방문, 조별 나눔, 주변 신사 방문 및 땅밟기 등",
      ],
      notes: ["조 편성과 조별 활동은 **웹공지로 안내**할 예정이에요."],
    },
  ],

  // 팀 담당자 제출 (/japan/team, 마감됨)
  leaderSolo: "혼자 이동하시는 분도 제출해 주세요. 함께 다닐 수 있도록 연결해 드릴게요.",
  leaderDeadline: "11/8(주일)",

  // 잠금화면 (public/japan/wallpaper-*.jpg 원본을 저장, 화면엔 작은 그림). color 는 저장 버튼 색 (그림 바탕색)
  wallpaperText: "휴대폰 **잠금화면**으로 쓸 수 있는 집회 배경화면이에요. 아래 그림을 눌러 고른 뒤 **저장하기**를 눌러 주세요.",
  wallpaperHelp: "저장이 안 되면 위 큰 그림을 길게 눌러 '이미지 저장'을 해 주세요.",
  lockDate: "11월 20일 금요일", // 미리보기 위 날짜·시계 (집회 첫날)
  lockTime: "11:20",
  wallpapers: [
    { name: "빨강", file: "/japan/wallpaper-red.jpg", thumb: "/japan/wallpaper-red-thumb.webp", color: "#7a0d10" },
    { name: "검정", file: "/japan/wallpaper-black.jpg", thumb: "/japan/wallpaper-black-thumb.webp", color: "#1c1c1c" },
    { name: "남색", file: "/japan/wallpaper-navy.jpg", thumb: "/japan/wallpaper-navy-thumb.webp", color: "#1b2b4f" },
  ],

  // 확인해두면 좋을 것
  passport: "**유효기간**을 꼭 확인해 주세요.",
  insurance: "**개별 가입**을 권장합니다.",
  visitJapan: "출국 전 **비짓재팬(Visit Japan Web)**에 등록해 주세요. 적는 방법은 위 **비짓재팬 등록** 칸에 있어요.",
  esim: "현지에서 쓸 **eSIM이나 로밍**을 미리 준비해 주세요.",
  supplies: "성경, 개인 상비약, 환전, 멀티 어댑터, 11월 오이타 날씨에 맞는 옷 등",

  // 스태프 신청 (맨 위·하단 버튼)
  staffLink: "/staff",

  // 준비 기도모임 (날짜마다 카드 하나)
  prayerDates: ["11/7(토)", "11/14(토)"],
  prayerTime: "오후 10시",
  prayerMust: "토요 기도회 참석 필수",
  prayerPlace: "NGC 강당",
  prayerText: "집회는 당일에만 준비하는 것이 아니라 **기도로 먼저 준비하는 자리**입니다. 함께 모여 기도하며 하나님께서 일본 땅 가운데 행하실 일을 기대합시다! 매 집회 이후에도 다음 집회를 위해 기도로 준비합니다.",

  // 문의·긴급 연락처. 전부 비어 있으면 문의 버튼과 연락처 칸이 숨겨집니다.
  // phone 은 010-0000-0000 형식, link 는 카톡 오픈채팅 등
  contactName: "",
  contactPhone: "",
  contactLink: "",
  emergencyName: "",
  emergencyPhone: "",

  // 맨 아래 남색 띠 문구 (한 줄씩)
  closing: ["우리는 선교하러 갑니다", "우리는 한 팀으로 갑니다", "우리는 예배하러 갑니다"],
};
