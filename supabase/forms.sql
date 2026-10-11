-- ============================================================
--  예약 설문 여러 개 만들기 (관리자 > 설정)
--  interview.sql 을 실행한 뒤, 이 파일을 SQL Editor 에서 Run 하세요.
--  여러 번 실행해도 안전합니다. 기존 면담 예약은 그대로 남습니다.
-- ============================================================

-- 1. 설문 (주소, 제목, 마감일, 시간대, 질문)
create table if not exists public.forms (
  id         text primary key                       -- 주소: 사이트주소/{id}
             check (id ~ '^[a-z0-9-]{2,40}$' and id not in ('admin', 'api')),
  title      text not null check (length(title) between 1 and 60),
  intro      text not null default '',              -- 질문 위 안내 문구
  deadline   date not null,                         -- 이 날짜까지 신청 받음 (한국 시간)
  slots      jsonb not null default '[]',           -- [{"slot":"2026-10-14 15:00","place":"..."}]
  closed     jsonb not null default '[]',           -- 관리자가 닫은 시간 ["2026-10-14 15:00"]
  questions  jsonb not null default '[]',           -- ["질문1", "질문2"]
  created_at timestamptz not null default now()
);

-- 설문 내용은 누구나 조회 (예약 페이지에 띄워야 하므로). 수정은 서버(api/admin)만.
alter table public.forms enable row level security;
drop policy if exists "누구나 조회" on public.forms;
create policy "누구나 조회" on public.forms for select to anon, authenticated using (true);

-- 2. 지금 쓰고 있는 면담 예약을 첫 번째 설문으로 옮김
insert into public.forms (id, title, intro, deadline, slots, questions) values (
  'interview', '면담 예약',
  '풍성한 면담을 위해 아래 사전 질문은 가능한 한 구체적으로 작성 부탁드립니다.',
  '2026-10-13',
  '[
    {"slot":"2026-10-14 15:00","place":"1층 카페 유리룸"},
    {"slot":"2026-10-15 10:00","place":"1층 카페 유리룸"},
    {"slot":"2026-10-21 15:00","place":"1층 카페 유리룸"},
    {"slot":"2026-10-22 10:00","place":"1층 카페 유리룸"},
    {"slot":"2026-10-25 16:00","place":"창보센"},
    {"slot":"2026-10-28 15:00","place":"1층 카페 유리룸"},
    {"slot":"2026-10-29 10:00","place":"1층 카페 유리룸"},
    {"slot":"2026-11-04 15:00","place":"1층 카페 유리룸"},
    {"slot":"2026-11-05 10:00","place":"1층 카페 유리룸"},
    {"slot":"2026-11-07 09:30","place":"1층 카페 유리룸"},
    {"slot":"2026-11-07 11:00","place":"1층 카페 유리룸"},
    {"slot":"2026-11-11 15:00","place":"1층 카페 유리룸"},
    {"slot":"2026-11-12 10:00","place":"1층 카페 유리룸"},
    {"slot":"2026-11-15 16:00","place":"창보센"},
    {"slot":"2026-11-18 15:00","place":"1층 카페 유리룸"},
    {"slot":"2026-11-19 10:00","place":"1층 카페 유리룸"},
    {"slot":"2026-11-21 09:30","place":"1층 카페 유리룸"},
    {"slot":"2026-11-21 11:00","place":"1층 카페 유리룸"},
    {"slot":"2026-11-22 16:00","place":"창보센"}
  ]',
  '["간단한 자기소개", "어떤 형태로, 어느 나라에 가고자 하시나요?", "내가 생각하는 ''셀''의 의미", "희망 출국 시기", "면담 시 나누고 싶은 내용이나 질문"]'
) on conflict (id) do nothing;

-- 3. 예약에 "어느 설문인지" 붙이기. 중복 체크도 설문별로.
--    (테이블 이름은 예전 그대로 interview_reservations 를 씁니다)
alter table public.interview_reservations
  add column if not exists form_id text not null default 'interview'
  references public.forms(id) on delete cascade;

alter table public.interview_reservations drop constraint if exists interview_reservations_slot_key;
alter table public.interview_reservations drop constraint if exists interview_reservations_user_phone_key;
create unique index if not exists interview_reservations_form_slot_key
  on public.interview_reservations (form_id, slot);
create unique index if not exists interview_reservations_form_phone_key
  on public.interview_reservations (form_id, user_phone);

-- 4. 신청 규칙: 마감 전 + 그 설문에 있는 시간 + 관리자가 닫지 않은 시간만
drop policy if exists "관리자 전체 권한" on public.interview_reservations;
drop policy if exists "누구나 신청" on public.interview_reservations;
create policy "누구나 신청" on public.interview_reservations
  for insert to anon, authenticated
  with check (exists (
    select 1 from public.forms f
     where f.id = form_id
       and (now() at time zone 'Asia/Seoul')::date <= f.deadline
       and f.slots @> jsonb_build_array(jsonb_build_object('slot', slot))
       and not f.closed ? slot
  ));

-- 5. 예약 페이지용: 그 설문에서 예약된 시간만 (이름/번호 없이)
create or replace function public.form_taken(p_form text)
returns setof text
language sql
security definer
set search_path = public
as $$ select slot from public.interview_reservations where form_id = p_form; $$;

grant execute on function public.form_taken(text) to anon, authenticated;
