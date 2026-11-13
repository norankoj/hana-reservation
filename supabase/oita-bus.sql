-- ============================================================
--  오이타 버스 탑승 체크 (/oita/bus)
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요. 여러 번 실행해도 안전합니다.
--  명단은 app/oita/bus/page.tsx 에 있고, 여기엔 "누가 언제 탔는지" 체크만 저장합니다.
--  key 는 '1호차/권성민' 처럼 호차/이름.
-- ============================================================

create table if not exists public.oita_bus_checks (
  key  text primary key check (length(key) between 3 and 40),
  at   timestamptz not null default now()
);

alter table public.oita_bus_checks enable row level security;

-- 읽기는 누구나 (이름과 체크 시각뿐)
grant select on public.oita_bus_checks to anon, authenticated;
drop policy if exists "누구나 보기" on public.oita_bus_checks;
create policy "누구나 보기" on public.oita_bus_checks for select to anon, authenticated using (true);

-- 체크/해제는 이 함수로만. 켜면 시각을 돌려주고, 끄면 null.
create or replace function public.oita_bus_check(p_key text, p_on boolean)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare t timestamptz;
begin
  if p_on then
    insert into public.oita_bus_checks (key) values (p_key)
      on conflict (key) do update set at = oita_bus_checks.at
      returning at into t;
    return t;
  end if;
  delete from public.oita_bus_checks where key = p_key;
  return null;
end;
$$;

grant execute on function public.oita_bus_check(text, boolean) to anon, authenticated;

-- 호차 하나 전체 초기화 (귀국 편에서 다시 쓸 때)
create or replace function public.oita_bus_reset(p_bus text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.oita_bus_checks where key like p_bus || '/%';
$$;

grant execute on function public.oita_bus_reset(text) to anon, authenticated;
