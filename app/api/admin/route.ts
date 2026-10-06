import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "node:crypto";

// 관리자 기능은 서버에서만. 비밀번호(ADMIN_PASSWORD)가 맞을 때만
// 서비스 키로 명단을 읽고 고칩니다. (브라우저에는 서비스 키가 가지 않음)

const hash = (s: string) => createHash("sha256").update(s).digest();
const passwordOk = (p: unknown) =>
  !!process.env.ADMIN_PASSWORD &&
  typeof p === "string" &&
  timingSafeEqual(hash(p), hash(process.env.ADMIN_PASSWORD));

const table = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  ).from("interview_reservations");

export async function POST(request: Request) {
  const b = await request.json().catch(() => null);
  if (!passwordOk(b?.password))
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { data, error } =
    b.action === "cancel"
      ? await table().delete().eq("id", b.id)
      : b.action === "move"
        ? await table().update({ slot: String(b.slot) }).eq("id", b.id)
        : await table().select("*");

  if (error)
    return NextResponse.json(
      { error: error.code === "23505" ? "TAKEN" : "ERROR" },
      { status: 400 },
    );
  return NextResponse.json({ rows: data ?? [] });
}
