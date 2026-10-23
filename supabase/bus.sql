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

-- 남은 자리 (버스 24석. 왕복은 가는 편·오는 편 둘 다 한 자리씩). 이름·번호 없이 숫자만 공개.
create or replace function public.bus_left()
returns table (go int, back int)
language sql
security definer
set search_path = public
as $$
  select 24 - count(*) filter (where route in ('왕복', '가는 편만'))::int,
         24 - count(*) filter (where route in ('왕복', '오는 편만'))::int
    from public.bus_signups;
$$;

grant execute on function public.bus_left() to anon, authenticated;

-- 신청은 누구나 11/1 까지 (한국 시간), 자리가 남은 편만. 조회·삭제는 관리자 페이지가 서버(api/admin)에서 서비스 키로만.
drop policy if exists "누구나 신청" on public.bus_signups;
create policy "누구나 신청" on public.bus_signups
  for insert to anon, authenticated
  with check (
    (now() at time zone 'Asia/Seoul')::date <= date '2026-11-01'
    and (route = '오는 편만' or (select go from public.bus_left()) > 0)
    and (route = '가는 편만' or (select back from public.bus_left()) > 0)
  );
