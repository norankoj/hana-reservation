-- ============================================================
--  셔틀 명단 추가·수정 — Supabase SQL Editor 에 붙여넣고 Run.
--  이미 있는 이름은 넣지 않으므로 여러 번 실행해도 안전합니다.
-- ============================================================

-- 조은희님 소속 채우기 (먼저 이름만 넣어 둔 분)
update public.shuttle_passengers set affil = '3C18' where name = '조은희';

-- 추가 인원 (전원 소속 1B11, 왕복)
--  ※ 이현우B(010-8586-3216) 는 이미 명단에 있어서 넣지 않습니다. 소속·연락처도 같아 같은 분입니다.
insert into public.shuttle_passengers (seq, name, affil, phone, route)
select (select coalesce(max(seq), 0) + 1 from public.shuttle_passengers), '김현우', '1B11', '010-9832-5577', '왕복'
 where not exists (select 1 from public.shuttle_passengers where name = '김현우');

insert into public.shuttle_passengers (seq, name, affil, phone, route)
select (select coalesce(max(seq), 0) + 1 from public.shuttle_passengers), '이민형B', '1B11', '010-4594-9312', '왕복'
 where not exists (select 1 from public.shuttle_passengers where name = '이민형B');

insert into public.shuttle_passengers (seq, name, affil, phone, route)
select (select coalesce(max(seq), 0) + 1 from public.shuttle_passengers), '하경현', '1B11', '010-3544-4923', '왕복'
 where not exists (select 1 from public.shuttle_passengers where name = '하경현');

-- 확인용. 82명 / 출발편 80명 / 귀가편 76명 이 되어야 맞습니다.
select count(*) as 전체,
       count(*) filter (where route in ('왕복', '출발만')) as 출발편,
       count(*) filter (where route in ('왕복', '귀가만')) as 귀가편
  from public.shuttle_passengers;
