import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual } from "node:crypto";
import type { Form } from "@/lib/form";

// 관리자 기능은 서버에서만. 비밀번호(ADMIN_PASSWORD)가 맞을 때만
// 서비스 키로 명단/설문을 읽고 고칩니다. (브라우저에는 서비스 키가 가지 않음)
const hash = (s: string) => createHash("sha256").update(s).digest();
const passwordOk = (p: unknown) =>
  !!process.env.ADMIN_PASSWORD &&
  typeof p === "string" &&
  timingSafeEqual(hash(p), hash(process.env.ADMIN_PASSWORD));

const fail = (error: string) => NextResponse.json({ error }, { status: 400 });

export async function POST(request: Request) {
  const b = await request.json().catch(() => null);
  if (!passwordOk(b?.password))
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  );
  const reservations = () => db.from("interview_reservations");
  const forms = () => db.from("forms");
  const formId = String(b.formId ?? "");

  switch (b.action) {
    // 설문 목록 (로그인 확인 겸용)
    case "forms": {
      const { data } = await forms().select("*").order("created_at", { ascending: false });
      return NextResponse.json({ forms: data ?? [] });
    }

    case "list": {
      const { data } = await reservations().select("*").eq("form_id", formId);
      return NextResponse.json({ rows: data ?? [] });
    }

    case "cancel": {
      const { error } = await reservations().delete().eq("id", b.id);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }

    case "move": {
      const { error } = await reservations().update({ slot: String(b.slot) }).eq("id", b.id);
      return error ? fail(error.code === "23505" ? "TAKEN" : "ERROR") : NextResponse.json({ ok: true });
    }

    // 빈 시간 닫기 / 다시 열기
    case "toggle": {
      const { data: f } = await forms().select("closed").eq("id", formId).single();
      if (!f) return fail("ERROR");
      const slot = String(b.slot);
      const closed: string[] = f.closed.includes(slot)
        ? f.closed.filter((s: string) => s !== slot)
        : [...f.closed, slot];
      const { error } = await forms().update({ closed }).eq("id", formId);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }

    case "save": {
      const f = b.form as Form;
      const row = {
        title: String(f.title ?? "").trim(),
        intro: String(f.intro ?? ""),
        deadline: f.deadline,
        slots: [...f.slots].sort((x, y) => x.slot.localeCompare(y.slot)),
        questions: f.questions.map((q) => q.trim()).filter(Boolean),
      };
      const times = row.slots.map((s) => s.slot);
      if (
        !row.title ||
        !/^\d{4}-\d{2}-\d{2}$/.test(row.deadline) ||
        times.some((t) => !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(t)) ||
        new Set(times).size !== times.length
      )
        return fail("INVALID");
      if (b.isNew) {
        const { error } = await forms().insert({ id: f.id, ...row });
        return error ? fail(error.code === "23505" ? "ID_TAKEN" : "INVALID") : NextResponse.json({ ok: true });
      }
      // 예약이 들어온 시간은 설정에서 지울 수 없게 (예약이 붕 뜨지 않도록)
      const { data: booked } = await reservations().select("slot").eq("form_id", f.id);
      const keep = new Set(row.slots.map((s) => s.slot));
      const lost = (booked ?? []).filter((r) => !keep.has(r.slot)).map((r) => r.slot);
      if (lost.length) return NextResponse.json({ error: "BOOKED", slots: lost }, { status: 400 });
      const { error } = await forms().update(row).eq("id", f.id);
      return error ? fail("INVALID") : NextResponse.json({ ok: true });
    }

    // 설문 삭제 (예약/응답도 함께 삭제됨)
    case "delete": {
      const { error } = await forms().delete().eq("id", formId);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }
  }
  return fail("UNKNOWN");
}
