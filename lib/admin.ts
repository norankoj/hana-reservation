// 관리자 화면 공통: 비밀번호는 이 탭에서만 기억 (탭을 닫으면 다시 로그인)
export const savedPassword = () => {
  try {
    return sessionStorage.getItem("adminPw");
  } catch {
    return null;
  }
};

export const savePassword = (pw: string | null) => {
  try {
    if (pw) sessionStorage.setItem("adminPw", pw);
    else sessionStorage.removeItem("adminPw");
  } catch {}
};

/** /api/admin 호출. status 401 이면 비밀번호가 틀린 것 */
export const adminApi = async (pw: string, body: object) => {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pw, ...body }),
  });
  return { status: res.status, ...(await res.json().catch(() => ({}))) };
};
