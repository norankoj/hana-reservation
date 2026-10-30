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

/** 엑셀에서 바로 열리는 CSV 다운로드 (한글 깨짐 방지 BOM 포함). 파일 이름 뒤에 오늘 날짜가 붙음 */
export const downloadCsv = (name: string, rows: string[][]) => {
  // 신청자가 =, + 등으로 시작하게 적으면 엑셀이 수식으로 실행하므로 막음
  const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
  const csv = rows.map((line) => line.map(cell).join(",")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  a.download = `${name}_${new Date().toLocaleDateString("sv-SE")}.csv`;
  a.click();
};
