-- ============================================================
--  오이타 집회 (/japan) — 인천공항행 버스 신청(/japan/bus), 팀 담당자 제출(/japan/team)
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요. 여러 번 실행해도 안전합니다.
-- ============================================================

-- 인천공항행 버스: 단체·개별 항공 누구나
create table if not exists public.japan_bus_signups (
  id          bigint generated always as identity primary key,
  name        text not null check (length(trim(name)) between 1 and 30),
  phone       text not null check (phone ~ '^01\d-\d{3,4}-\d{4}$'),
  cell        text not null check (length(trim(cell)) between 1 and 30),
  route       text not null default '왕복' check (route in ('왕복', '가는 편만', '오는 편만')),
  flight      text not null check (flight in ('단체 항공', '개별 항공')),
  created_at  timestamptz not null default now()
);

-- 팀 담당자: 팀이면 함께 가는 분 필수, 혼자 이동하는 분도 받아서 묶어 줌
create table if not exists public.japan_team_signups (
  id          bigint generated always as identity primary key,
  kind        text not null check (kind in ('팀', '혼자')),
  name        text not null check (length(trim(name)) between 1 and 30),
  phone       text not null check (phone ~ '^01\d-\d{3,4}-\d{4}$'),
  cell        text not null check (length(trim(cell)) between 1 and 30),
  members     text not null default '' check (length(members) <= 500),
  memo        text not null default '' check (length(memo) <= 300),
  created_at  timestamptz not null default now(),
  check (kind = '혼자' or length(trim(members)) > 0)
);

alter table public.japan_bus_signups enable row level security;
alter table public.japan_team_signups enable row level security;

-- 신청은 누구나 11/8 까지 (한국 시간). 조회·삭제는 관리자 페이지가 서버(api/admin)에서 서비스 키로만.
-- 마감일을 바꾸면 app/japan/info.ts 의 formDeadline 도 같이 바꿔 주세요.
drop policy if exists "누구나 신청" on public.japan_bus_signups;
create policy "누구나 신청" on public.japan_bus_signups
  for insert to anon, authenticated
  with check ((now() at time zone 'Asia/Seoul')::date <= date '2026-11-08');

drop policy if exists "누구나 제출" on public.japan_team_signups;
create policy "누구나 제출" on public.japan_team_signups
  for insert to anon, authenticated
  with check ((now() at time zone 'Asia/Seoul')::date <= date '2026-11-08');
