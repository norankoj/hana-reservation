// 셔틀 명단. 엑셀에서 복사해 붙여넣은 글을 명단 줄로 바꿉니다.
export const ROUTES = ["왕복", "출발만", "귀가만"] as const;
export type Route = (typeof ROUTES)[number];
export type Row = { name: string; affil: string; phone: string; route: Route };

/** 엑셀 표기를 우리 값으로. 비어 있으면 왕복으로 봅니다 */
const toRoute = (s: string): Route | null => {
  const t = s.replace(/\s/g, "");
  if (!t) return "왕복";
  if (ROUTES.includes(t as Route)) return t as Route;
  // 엑셀마다 달리 적힌 것들
  if (/^(가는편만?|편도\(가는\)|출발)$/.test(t)) return "출발만";
  if (/^(오는편만?|편도\(오는\)|귀가|복귀)$/.test(t)) return "귀가만";
  if (/^(왕복\(.*\)|양방향)$/.test(t)) return "왕복";
  return null;
};

/** 번호에서 숫자만 뽑아 010-1234-5678 꼴로. 못 고치면 빈 값 */
const toPhone = (s: string) => {
  let d = s.replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("82")) d = "0" + d.slice(2); // +82 10 ...
  if (!d.startsWith("0")) d = "0" + d; // 앞 0 이 빠진 채 복사된 경우
  if (!/^01\d{8,9}$/.test(d)) return "";
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
};

/**
 * 붙여넣은 명단을 줄로 나눕니다. 한 줄에 「이름, 소속, 연락처, 탑승」 (탭·쉼표 구분).
 * 머리글 줄과 번호 칸은 알아서 건너뜁니다. 고칠 수 없는 줄은 errors 로 돌려줍니다.
 */
export const parseRoster = (text: string) => {
  const rows: Row[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    let cells = line.split(/\t|,/).map((c) => c.trim().replace(/^"|"$/g, ""));
    // 맨 앞이 순번이면 뺍니다 (엑셀에서 번호 칸까지 복사한 경우)
    if (cells.length > 4 && /^\d+$/.test(cells[0])) cells = cells.slice(1);
    const [name = "", affil = "", phone = "", route = ""] = cells;
    if (!name || /^(이름|성명|번호)$/.test(name)) return; // 머리글 줄
    const r = toRoute(route);
    if (!r) return void errors.push(`${i + 1}번째 줄 「${name}」: 탑승을 알 수 없습니다 (${route})`);
    if (name.length > 30) return void errors.push(`${i + 1}번째 줄: 이름이 너무 깁니다`);
    if (seen.has(name)) return void errors.push(`${i + 1}번째 줄 「${name}」: 이름이 겹칩니다`);
    seen.add(name);
    rows.push({ name, affil, phone: toPhone(phone), route: r });
  });

  return { rows, errors };
};
