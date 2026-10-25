-- ============================================================
--  셔틀 명단에 한 명 추가 — Supabase SQL Editor 에 붙여넣고 Run.
--  이미 있는 이름이면 넣지 않으므로 여러 번 실행해도 안전합니다.
--  다음에 또 추가할 때는 아래 values 의 네 값만 바꿔서 쓰세요.
--    (이름, 소속, 연락처, 왕복/출발만/귀가만)
-- ============================================================

insert into public.shuttle_passengers (seq, name, affil, phone, route)
select (select coalesce(max(seq), 0) + 1 from public.shuttle_passengers),
       '조은희', '', '010-8848-2464', '왕복'
 where not exists (select 1 from public.shuttle_passengers where name = '조은희');

-- 확인용. 78 + 1 = 79명, 가는 편 77명 / 오는 편 73명이 됩니다.
select count(*) as 전체,
       count(*) filter (where route in ('왕복', '출발만')) as 출발편,
       count(*) filter (where route in ('왕복', '귀가만')) as 귀가편
  from public.shuttle_passengers;
