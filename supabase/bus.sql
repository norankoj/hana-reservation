-- ============================================================
--  결혼식 버스 신청 (/bus) — 석의찬 ♥ 이수현, 2026-11-07
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요. 여러 번 실행해도 안전합니다.
-- ============================================================

create table if not exists public.bus_signups (
  id          bigint generated always as identity primary key,
  name        text not null check (length(trim(name)) between 1 and 30),
  phone       text not null check (phone ~ '^01\d-\d{3,4}-\d{4}$'),
  route       text not null default '왕복' check (route in ('왕복', '가는 편만', '오는 편만')),
  memo        text not null default '' check (length(memo) <= 200),
  created_at  timestamptz not null default now()
);

alter table public.bus_signups enable row level security;

-- 신청은 누구나 10/26 까지 (한국 시간). 조회·삭제는 관리자 페이지가 서버(api/admin)에서 서비스 키로만.
drop policy if exists "누구나 신청" on public.bus_signups;
create policy "누구나 신청" on public.bus_signups
  for insert to anon, authenticated
  with check ((now() at time zone 'Asia/Seoul')::date <= date '2026-10-26');
