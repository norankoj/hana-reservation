import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash, timingSafeEqual, randomUUID } from "node:crypto";
import { type Form, QUESTION_TYPES, hasOptions, questionsOf } from "@/lib/form";

// 관리자 기능은 서버에서만. 비밀번호가 맞을 때만 서비스 키로 명단/설문을 읽고 고칩니다.
// (브라우저에는 서비스 키가 가지 않음)
//  ADMIN_PASSWORD: 전부 / GOODS_PASSWORD: 굿즈 주문(goods* 동작)만, 면담 명단은 못 봄
const hash = (s: string) => createHash("sha256").update(s).digest();
// 앞뒤 공백은 무시 (Vercel 에 값을 붙여넣다 공백·줄바꿈이 섞여도 로그인되도록)
const passwordOk = (p: unknown, secret: string | undefined) =>
  !!secret?.trim() && typeof p === "string" && timingSafeEqual(hash(p.trim()), hash(secret.trim()));

const fail = (error: string) => NextResponse.json({ error }, { status: 400 });

// 셔틀 명단 한 줄 검사 (/admin/shuttle). 틀린 값은 넣지 않고 되돌립니다
const SHUTTLE_ROUTES = ["왕복", "출발만", "귀가만"];
const shuttleRow = (v: { name?: unknown; affil?: unknown; phone?: unknown; route?: unknown }) => {
  const name = String(v?.name ?? "").trim();
  const affil = String(v?.affil ?? "").trim();
  const phone = String(v?.phone ?? "").trim();
  const route = String(v?.route ?? "");
  const ok =
    name.length >= 1 && name.length <= 30 &&
    affil.length <= 30 &&
    (phone === "" || /^01\d-\d{3,4}-\d{4}$/.test(phone)) &&
    SHUTTLE_ROUTES.includes(route);
  return ok ? { name, affil, phone, route } : null;
};

export async function POST(request: Request) {
  const b = await request.json().catch(() => null);
  const allowed =
    passwordOk(b?.password, process.env.ADMIN_PASSWORD) ||
    (passwordOk(b?.password, process.env.GOODS_PASSWORD) && String(b?.action).startsWith("goods"));
  if (!allowed)
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
        questions: questionsOf(f)
          .map((q) => ({
            label: String(q.label ?? "").trim(),
            type: q.type,
            options: hasOptions(q.type) ? q.options.map((o) => String(o).trim()).filter(Boolean) : [],
            required: !!q.required,
          }))
          .filter((q) => q.label),
      };
      const times = row.slots.map((s) => s.slot);
      const labels = row.questions.map((q) => q.label);
      if (
        !row.title ||
        row.questions.some((q) => !(q.type in QUESTION_TYPES) || (hasOptions(q.type) && !q.options.length)) ||
        new Set(labels).size !== labels.length || // 답변을 질문 글로 저장하므로 같은 질문 두 개는 안 됨
        !/^\d{4}-\d{2}-\d{2}$/.test(row.deadline) ||
        times.some((t) => !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(t)) ||
        new Set(times).size !== times.length
      )
        return fail("INVALID");
      if (b.isNew) {
        // 주소는 랜덤 (기도의 잔처럼). 예: /k3x9a2mf
        const id = randomUUID().replace(/-/g, "").slice(0, 8);
        const { error } = await forms().insert({ id, ...row });
        return error ? fail("INVALID") : NextResponse.json({ ok: true, id });
      }
      // 예약이 들어온 시간은 설정에서 지울 수 없게 (예약이 붕 뜨지 않도록)
      const { data: booked } = await reservations().select("slot").eq("form_id", f.id);
      const keep = new Set(row.slots.map((s) => s.slot));
      const lost = (booked ?? []).filter((r) => !keep.has(r.slot)).map((r) => r.slot);
      if (lost.length) return NextResponse.json({ error: "BOOKED", slots: lost }, { status: 400 });
      const { error } = await forms().update(row).eq("id", f.id);
      return error ? fail("INVALID") : NextResponse.json({ ok: true, id: f.id });
    }

    // 굿즈 주문 (/admin/goods)
    case "goods": {
      const { data } = await db.from("goods_orders").select("*").order("created_at");
      return NextResponse.json({ rows: data ?? [] });
    }

    case "goodsInquiries": {
      const { data } = await db.from("goods_inquiries").select("*").order("created_at", { ascending: false });
      return NextResponse.json({ rows: data ?? [] });
    }

    case "goodsPaid": {
      const { error } = await db.from("goods_orders").update({ paid: !!b.paid }).eq("id", b.id);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }

    case "goodsDelete": {
      const { error } = await db.from("goods_orders").delete().eq("id", b.id);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }

    // 결혼식 버스 신청 (/admin/bus)
    case "bus": {
      const { data } = await db.from("bus_signups").select("*").order("created_at");
      return NextResponse.json({ rows: data ?? [] });
    }

    case "busDelete": {
      const { error } = await db.from("bus_signups").delete().eq("id", b.id);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }

    // 오이타 현장 STAFF 신청 (/admin/staff)
    case "staff": {
      const { data } = await db.from("staff_signups").select("*").order("created_at");
      return NextResponse.json({ rows: data ?? [] });
    }

    case "staffDelete": {
      const { error } = await db.from("staff_signups").delete().eq("id", b.id);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }

    // 오이타 집회 버스·팀 담당자 (/admin/japan)
    case "japan": {
      const [bus, team] = await Promise.all([
        db.from("japan_bus_signups").select("*").order("created_at"),
        db.from("japan_team_signups").select("*").order("created_at"),
      ]);
      return NextResponse.json({ bus: bus.data ?? [], team: team.data ?? [] });
    }

    case "japanDelete": {
      const table = b.kind === "team" ? "japan_team_signups" : "japan_bus_signups";
      const { error } = await db.from(table).delete().eq("id", b.id);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }

    // 탑승(왕복/가는 편만/오는 편만) 바꾸기. 값은 DB 체크 supabase/japan.sql 과 같게
    case "japanBusRoute": {
      if (!["왕복", "가는 편만", "오는 편만"].includes(String(b.route))) return fail("INVALID");
      const { error } = await db.from("japan_bus_signups").update({ route: b.route }).eq("id", b.id);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }

    // 크리스마스 마켓 스탭 (/admin/christmas)
    case "christmas": {
      const { data } = await db.from("christmas_signups").select("*").order("created_at");
      return NextResponse.json({ rows: data ?? [] });
    }

    case "christmasDelete": {
      const { error } = await db.from("christmas_signups").delete().eq("id", b.id);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }

    // 셔틀 탑승 명단 (/admin/shuttle). 체크 화면은 공개 뷰로 읽고, 명단 수정만 여기서.
    case "shuttle": {
      const { data } = await db.from("shuttle_passengers").select("*").order("name");
      return NextResponse.json({ rows: data ?? [] });
    }

    case "shuttleAdd": {
      const row = shuttleRow(b);
      if (!row) return fail("INVALID");
      const { data: last } = await db.from("shuttle_passengers").select("seq").order("seq", { ascending: false }).limit(1);
      const { error } = await db.from("shuttle_passengers").insert({ seq: (last?.[0]?.seq ?? 0) + 1, ...row });
      return error ? fail(error.code === "23505" ? "DUPLICATE" : "ERROR") : NextResponse.json({ ok: true });
    }

    case "shuttleDelete": {
      const { error } = await db.from("shuttle_passengers").delete().eq("id", b.id);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }

    case "shuttleRoute": {
      if (!SHUTTLE_ROUTES.includes(String(b.route))) return fail("INVALID");
      const { error } = await db.from("shuttle_passengers").update({ route: b.route }).eq("id", b.id);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }

    // 명단 통째로 교체 (다음 행사). 탑승 체크는 모두 지워집니다
    case "shuttleReplace": {
      const rows = (Array.isArray(b.rows) ? b.rows : []).map(shuttleRow);
      if (!rows.length || rows.some((r: unknown) => !r)) return fail("INVALID");
      const names = rows.map((r: { name: string }) => r.name);
      if (new Set(names).size !== names.length) return fail("DUPLICATE");
      const { error: delError } = await db.from("shuttle_passengers").delete().gte("id", 0);
      if (delError) return fail("ERROR");
      const { error } = await db
        .from("shuttle_passengers")
        .insert(rows.map((r: object, i: number) => ({ seq: i + 1, ...r })));
      return error ? fail("ERROR") : NextResponse.json({ ok: true, count: rows.length });
    }

    // 설문 삭제 (예약/응답도 함께 삭제됨)
    case "delete": {
      const { error } = await forms().delete().eq("id", formId);
      return error ? fail("ERROR") : NextResponse.json({ ok: true });
    }
  }
  return fail("UNKNOWN");
}
