/**
 * 2026 프로미스랜드 오이타 굿즈 단체주문.
 * 상품 이름은 공식 주문서(엑셀) 「상품표」와 글자까지 똑같아야 합니다. (엑셀이 이름으로 가격을 찾음)
 */
export const GOODS_DEADLINE = "2026-10-21"; // 이 날짜까지 주문·입금 (DB 정책 supabase/goods.sql 과 같게)
export const DISCOUNT = 0.1; // 단체 사전구매 10%

// 우리 공동체 입금 계좌 (공식 계좌 아님. 담당자가 모아서 한 번에 보냄)
export const BANK = "카카오뱅크";
export const ACCOUNT_NO = "3333148175694";
export const ACCOUNT = `${BANK} 3333-14-8175694 (노나연)`;

/** 토스 앱 송금 화면을 받는 사람·금액이 채워진 채로 엶 (토스가 깔린 휴대폰에서만) */
export const tossLink = (amount: number) =>
  `supertoss://send?bank=${encodeURIComponent(BANK)}&accountNo=${ACCOUNT_NO}&amount=${amount}`;

export const SET = "올인원 세트";
export const SET_OPTIONS = {
  bandana: { label: "손수건", options: ["레드 웨이브", "블랙 스탬프"] },
  bag: { label: "바쿠백", options: ["블랙", "화이트"] },
  keyring: { label: "키링", options: ["1 스탬프", "2 십자가"] },
} as const;
type SetKey = keyof typeof SET_OPTIONS;

export type Product = {
  title: string;
  price: number; // 정가 (세트는 세트가)
  imgs: string[]; // public/goods 안의 사진. 옆으로 넘겨 봄
  items: string[]; // 엑셀 상품명. 고를 디자인이 없으면 하나
  sizes?: string[];
  sizeGuide?: string;
  note?: string;
  notice?: string; // 빨간 글씨로 강조
};

const img = (f: string) => `/goods/${f}.webp`;

export const PRODUCTS: Product[] = [
  {
    title: "후드집업", price: 52000, items: ["후드집업 - 그레이", "후드집업 - 블랙"],
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"], sizeGuide: img("16_size_hood"),
    note: "오버핏이라 일반 사이즈보다 큰 편이에요.",
    imgs: [img("01_hood_grey"), img("02_hood_black")],
  },
  {
    title: "그래픽 티셔츠", price: 30000, items: ["그래픽 티셔츠 - 블랙", "그래픽 티셔츠 - 화이트"],
    sizes: ["XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL"], sizeGuide: img("17_size_tee"),
    imgs: [img("03_tee_black"), img("04_tee_white")],
  },
  {
    title: "손수건", price: 10000, items: ["손수건 - 레드 웨이브", "손수건 - 블랙 스탬프"],
    imgs: [img("05_hanky_wave"), img("06_hanky_stamp"), img("07_hanky_style")],
  },
  { title: "바쿠백", price: 10000, items: ["바쿠백 - 블랙", "바쿠백 - 화이트"], imgs: [img("08_bag_black"), img("09_bag_white")] },
  { title: "핑거보드 키링", price: 6000, items: ["핑거보드 키링"], imgs: [img("10_fingerboard")] },
  { title: "키링", price: 5000, items: ["키링 1 - 스탬프", "키링 2 - 십자가"], imgs: [img("11_keyring_stamp"), img("12_keyring_cross")] },
  {
    title: "네임택", price: 4500, items: ["네임택 - 블랙 스탬프", "네임택 - 웨이브"],
    notice: "컨퍼런스 참가자는 1매씩 증정 예정",
    imgs: [img("14_nametag_stamp"), img("13_nametag_wave")],
  },
  { title: "스티커팩", price: 3000, items: ["스티커팩"], imgs: [img("15_sticker")] },
  {
    title: SET, price: 32000, items: [SET],
    note: "손수건 + 바쿠백 + 핑거보드 키링 + 키링 + 스티커팩 (디자인 각 1개씩 선택) · 정가 34,000원 → 세트가 32,000원",
    imgs: [img("07_hanky_style"), img("08_bag_black"), img("10_fingerboard"), img("11_keyring_stamp"), img("15_sticker")],
  },
];

/** 주문 한 줄 = 엑셀 「개인별 주문」 한 줄 */
export type Line = {
  item: string;
  size?: string;
  bandana?: string;
  bag?: string;
  keyring?: string;
  qty: number;
};

const productOf = (item: string) => PRODUCTS.find((p) => p.items.includes(item));

/** 할인 단가 (엑셀과 같이 반올림) */
export const unitPrice = (item: string) => Math.round((productOf(item)?.price ?? 0) * (1 - DISCOUNT));

export const total = (lines: Line[]) => lines.reduce((s, l) => s + unitPrice(l.item) * l.qty, 0);

export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/** 화면에 보이는 한 줄 설명. 예: "후드집업 - 그레이 / L" */
export const lineLabel = (l: Line) =>
  [l.item, l.size, l.bandana && `손수건 ${l.bandana}`, l.bag && `바쿠백 ${l.bag}`, l.keyring && `키링 ${l.keyring}`]
    .filter(Boolean)
    .join(" / ");

/** 잘못된 줄이면 이유, 괜찮으면 null. (DB 는 모양만 막으므로 관리자 화면에서 한 번 더 확인) */
export const lineError = (l: Line): string | null => {
  const p = productOf(l.item);
  if (!p) return "없는 상품";
  if (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > 20) return "수량 확인";
  if (p.sizes ? !p.sizes.includes(l.size ?? "") : l.size) return "사이즈 확인";
  for (const k of Object.keys(SET_OPTIONS) as SetKey[]) {
    const v = l[k];
    if (l.item === SET ? !(SET_OPTIONS[k].options as readonly string[]).includes(v ?? "") : v) return "세트 구성 확인";
  }
  return null;
};

/** 같은 상품·옵션이면 수량만 합침 */
export const addLine = (lines: Line[], l: Line): Line[] => {
  const same = lines.find((x) => lineLabel(x) === lineLabel(l));
  return same ? lines.map((x) => (x === same ? { ...x, qty: x.qty + l.qty } : x)) : [...lines, l];
};

/** 엑셀 「개인별 주문」 B~H 칸 (이름, 상품, 사이즈, 세트: 반다나, 세트: 바쿠백, 세트: 키링, 수량). 탭으로 구분 */
export const excelRows = (orders: { name: string; items: Line[] }[]) =>
  orders
    .flatMap((o) =>
      o.items.map((l) =>
        [o.name, l.item, l.size, l.bandana, l.bag, l.keyring, l.qty].map((v) => String(v ?? "").replace(/[\t\n\r]/g, " ")).join("\t"),
      ),
    )
    .join("\n");
