// 이름 검색용. 「ㄱㅅㅇ」 처럼 초성만 쳐도 찾게 합니다.
const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";

/** 한글의 첫 자음만 남김 (김선애 → ㄱㅅㅇ). 한글이 아닌 글자는 그대로 */
export const chosung = (s: string) =>
  [...s]
    .map((c) => {
      const i = c.charCodeAt(0) - 0xac00; // 가 ~ 힣
      return i >= 0 && i < 11172 ? CHO[Math.floor(i / 588)] : c;
    })
    .join("");

/** 검색어가 초성만이면 초성으로, 아니면 글자 그대로 찾습니다. 빈 검색어는 전부 통과 */
export const matches = (q: string, ...fields: string[]) => {
  const t = q.trim();
  if (!t) return true;
  const byCho = /^[ㄱ-ㅎ]+$/.test(t);
  return fields.some((f) => (byCho ? chosung(f) : f).includes(t));
};
