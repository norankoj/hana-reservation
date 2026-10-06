-- ============================================================
--  면담 예약 DB 설정
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요.
--  일정 목록은 lib/interview.ts 에 있습니다.
--  예약 취소 = Table Editor 에서 해당 행 삭제 (자리가 다시 열립니다)
-- ============================================================

create table if not exists public.interview_reservations (
  id          bigint generated always as identity primary key,
  slot        text not null unique,          -- 한 시간대에 한 명
  user_name   text not null check (length(trim(user_name)) between 1 and 30),
  user_phone  text not null unique           -- 한 사람당 한 번
              check (user_phone ~ '^01\d-\d{3,4}-\d{4}$'),
  created_at  timestamptz not null default now()
);

-- 사전 질문 답변 { "질문": "답변" } (질문이 늘어도 DB 수정 불필요)
alter table public.interview_reservations
  add column if not exists answers jsonb not null default '{}'
  check (length(answers::text) < 20000);

-- 소속셀
alter table public.interview_reservations
  add column if not exists cell text not null default ''
  check (length(cell) <= 30);

alter table public.interview_reservations enable row level security;

drop policy if exists "누구나 신청" on public.interview_reservations;
drop policy if exists "관리자 전체 권한" on public.interview_reservations;

-- 신청은 누구나 (마감일 10/13 까지, 한국 시간), 명단 조회는 로그인한 관리자만
create policy "누구나 신청" on public.interview_reservations
  for insert to anon, authenticated
  with check ((now() at time zone 'Asia/Seoul')::date <= date '2026-10-13');
create policy "관리자 전체 권한" on public.interview_reservations
  for all to authenticated using (true) with check (true);

-- 예약 페이지에는 "마감된 시간대" 만 (이름/번호 없이)
create or replace function public.interview_taken()
returns setof text
language sql
security definer
set search_path = public
as $$ select slot from public.interview_reservations; $$;

grant execute on function public.interview_taken() to anon, authenticated;
