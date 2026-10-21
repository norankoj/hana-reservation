-- ============================================================
--  오이타 현장 STAFF 신청 (/staff) — 2026 프로미스랜드 오이타
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요. 여러 번 실행해도 안전합니다.
-- ============================================================

create table if not exists public.staff_signups (
  id          bigint generated always as identity primary key,
  name        text not null check (length(trim(name)) between 1 and 30),
  cell        text not null check (length(trim(cell)) between 1 and 30),
  role        text not null check (role in ('내부', '로비', '외부', '하스피', '어떤 역할이든')),
  created_at  timestamptz not null default now()
);

alter table public.staff_signups enable row level security;

-- 신청은 누구나. 조회·삭제는 관리자 페이지가 서버(api/admin)에서 서비스 키로만.
drop policy if exists "누구나 신청" on public.staff_signups;
create policy "누구나 신청" on public.staff_signups
  for insert to anon, authenticated
  with check (true);
