-- ============================================================
--  크리스마스 마켓 스탭 모집 (/christmas), 명단은 /admin/christmas
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요. 여러 번 실행해도 안전합니다.
-- ============================================================

-- 스탭 종류 이름은 app/christmas/info.ts 에서 고치므로 여기서는 개수만 검사
create table if not exists public.christmas_signups (
  id          bigint generated always as identity primary key,
  name        text not null check (length(trim(name)) between 1 and 30),
  phone       text not null check (phone ~ '^01\d-\d{3,4}-\d{4}$'),
  cell        text not null check (length(trim(cell)) between 1 and 30),
  role        text not null check (length(role) between 1 and 30),
  memo        text not null default '' check (length(memo) <= 300),
  created_at  timestamptz not null default now()
);

alter table public.christmas_signups enable row level security;

-- 신청은 누구나 12/13 까지 (한국 시간). 조회·삭제는 관리자 페이지가 서버(api/admin)에서 서비스 키로만.
-- 마감일을 바꾸면 app/christmas/info.ts 의 formDeadline 도 같이 바꿔 주세요.
drop policy if exists "누구나 신청" on public.christmas_signups;
create policy "누구나 신청" on public.christmas_signups
  for insert to anon, authenticated
  with check ((now() at time zone 'Asia/Seoul')::date <= date '2026-12-13');
