// 크리스마스 마켓 스텝 모집 페이지(/christmas)의 문구·일정·스텝 종류는 전부 여기서만 고칩니다.
// 마감일을 바꾸면 supabase/christmas.sql 의 날짜도 같이 바꿔 주세요.
export const info = {
  title: "크리스마스 마켓 스텝 모집",
  shareDescription: "12/25(금) 수원하나교회 교육관 주차장. 크리스마스 마켓을 함께 만들 현장스텝·코스튬 스텝을 모집합니다",
  headline: "크리스마스 마켓\n스텝 모집",
  lead: "성탄의 기쁨을 이웃과 나누는 하루, 섬김이들을 모집합니다!",

  formDeadline: "2026-12-13", // 이 날짜까지 신청 받음 (한국 시간)
  deadlineLabel: "12월 13일 (주일)",

  facts: [
    { label: "일시", value: "12월 25일 (금) 오전 11시-오후 4시" },
    { label: "장소", value: "수원하나교회 교육관 주차장\n경기도 용인시 기흥구 새그내로53번길 30" },
  ],

  // 스텝 종류. name 은 명단에 그대로 저장됩니다 (신청이 들어온 뒤에는 이름을 바꾸지 마세요)
  // image 는 public/christmas/ 의 파일 이름
  roles: [
    {
      name: "현장스텝",
      desc: "식당 청소, 안내, 줄 세우기, 쓰레기 관리, 설거지, 준비, 음식 부스 도움 등 마켓 곳곳을 맡아요.",
      image: "craft-booth.webp",
    },
    {
      name: "코스튬 스텝",
      desc: "성탄 이야기 속 인물 옷을 입고 마켓 곳곳에서 손님을 맞아요.",      image: "costume.webp",
    },
  ],

  // 작년 마켓 사진 (public/christmas/)
  photos: [
    { src: "kids-game.webp", alt: "병뚜껑 컬링을 하는 아이들" },
    { src: "food-stall.webp", alt: "디저트 부스에서 계산하는 모습" },
    { src: "game-booth.webp", alt: "게임 부스 스텝들" },
    { src: "skewers.webp", alt: "숯불에 굽는 꼬치" },
    { src: "cup-stack.webp", alt: "컵 쌓기를 하는 아이" },
    { src: "kid-snack.webp", alt: "간식을 먹는 아이" },
    { src: "scoreboard.webp", alt: "병뚜껑 컬링 순위표" },
  ],

  contactLabel: "문의: 안진환 간사",
  contactLink: "", // 카톡 오픈채팅·인스타 링크를 넣으면 버튼이 나타납니다
};
