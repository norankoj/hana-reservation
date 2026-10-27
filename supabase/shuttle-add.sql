-- ============================================================
--  셔틀 명단 수정 — Supabase SQL Editor 에 붙여넣고 Run.
--  명단을 고칠 일이 생기면 이 파일 내용을 바꿔서 쓰세요. 여러 번 실행해도 안전합니다.
-- ============================================================

-- 한민정 자매님 제외
--  ※ 되돌리려면: insert into public.shuttle_passengers (seq, name, affil, phone, route)
--     select (select coalesce(max(seq),0)+1 from public.shuttle_passengers),
--            '한민정', '3A10', '010-6685-6645', '왕복';
delete from public.shuttle_passengers where name = '한민정';

-- 확인용. 81명 / 출발편 79명 / 귀가편 75명 이 되어야 맞습니다.
select count(*) as 전체,
       count(*) filter (where route in ('왕복', '출발만')) as 출발편,
       count(*) filter (where route in ('왕복', '귀가만')) as 귀가편
  from public.shuttle_passengers;
