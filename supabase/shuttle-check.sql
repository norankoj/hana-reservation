-- ============================================================
--  셔틀 탑승 체크 추가분 — shuttle.sql 을 이미 실행한 뒤에 이것만 더 Run 하세요.
--  명단은 건드리지 않습니다. 여러 번 실행해도 안전합니다.
-- ============================================================

-- 1) 담당자용(/shuttle/check) 명단. 바로 전화할 수 있게 연락처까지.
--    주소를 아는 사람만 보게 되므로 이 링크는 단체방에 올리지 말고 담당자에게만 보내세요.
create or replace view public.shuttle_roster as
  select id, seq, name, affil, phone, route, go_at, back_at
    from public.shuttle_passengers;

grant select on public.shuttle_roster to anon, authenticated;

-- 2) 뷰로는 읽기만. (뷰는 주인 권한으로 도니까, 막지 않으면 이름·연락처까지 고칠 수 있습니다)
revoke insert, update, delete on public.shuttle_board from anon, authenticated;
revoke insert, update, delete on public.shuttle_roster from anon, authenticated;

-- 3) 탑승 체크는 이 함수로만. 탑승 시각 한 칸만 바꾸고, 다른 건 손대지 못합니다.
--    (표에 직접 update 권한을 주면 RLS 때문에 0건만 바뀌고 성공처럼 보여서 체크가 풀렸습니다)
create or replace function public.shuttle_check(p_id bigint, p_leg text, p_on boolean)
returns timestamptz
language sql
security definer
set search_path = public
as $$
  update public.shuttle_passengers
     set go_at   = case when p_leg = 'go'   then (case when p_on then now() else null end) else go_at   end,
         back_at = case when p_leg = 'back' then (case when p_on then now() else null end) else back_at end
   where id = p_id and p_leg in ('go', 'back')
  returning case when p_leg = 'go' then go_at else back_at end;
$$;

grant execute on function public.shuttle_check(bigint, text, boolean) to anon, authenticated;

-- 4) 표에 직접 쓰는 권한은 거둬들입니다 (위 함수로만 바뀌도록)
revoke update on public.shuttle_passengers from anon, authenticated;
drop policy if exists "누구나 탑승 체크" on public.shuttle_passengers;

-- 5) 테스트로 바꿔 둔 값 되돌리기 (강순철님 출발 체크 해제)
update public.shuttle_passengers set go_at = null where seq = 1;
