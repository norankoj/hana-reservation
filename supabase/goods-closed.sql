-- ============================================================
--  굿즈 주문 마감 후 (/goods): 입금 확인 목록 + 문의
--  goods.sql 을 실행한 뒤, 이 파일을 SQL Editor 에서 Run 하세요. 여러 번 실행해도 안전합니다.
-- ============================================================

-- 1. 문의 (누구나 남기기만. 보는 건 관리자 페이지에서 서비스 키로만)
create table if not exists public.goods_inquiries (
  id          bigint generated always as identity primary key,
  name        text not null check (length(trim(name)) between 1 and 30),
  phone       text not null check (phone ~ '^01\d-\d{3,4}-\d{4}$'),
  message     text not null check (length(trim(message)) between 1 and 1000),
  created_at  timestamptz not null default now()
);

alter table public.goods_inquiries enable row level security;
drop policy if exists "누구나 문의" on public.goods_inquiries;
create policy "누구나 문의" on public.goods_inquiries
  for insert to anon, authenticated with check (true);

-- 2. 본인 확인용 입금 확인 목록. 이름은 가운데를 가리고(노*연) 연락처는 끝 4자리만.
--    전체 이름·번호·입금자명은 밖으로 나가지 않음.
create or replace function public.goods_paid_list()
returns table (name text, phone4 text, items jsonb)
language sql
security definer
set search_path = public
as $$
  select
    case when char_length(o.name) <= 2 then left(o.name, 1) || '*'
         else left(o.name, 1) || repeat('*', char_length(o.name) - 2) || right(o.name, 1) end,
    right(o.phone, 4),
    o.items
  from public.goods_orders o
  where o.paid
  order by o.name, o.id;
$$;

grant execute on function public.goods_paid_list() to anon, authenticated;
