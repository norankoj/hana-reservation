-- ============================================================
--  오이타 굿즈 단체주문 (/goods)
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요. 여러 번 실행해도 안전합니다.
-- ============================================================

create table if not exists public.goods_orders (
  id          bigint generated always as identity primary key,
  name        text not null check (length(trim(name)) between 1 and 30),
  phone       text not null check (phone ~ '^01\d-\d{3,4}-\d{4}$'),
  depositor   text not null default '' check (length(depositor) <= 30), -- 입금자명이 이름과 다를 때
  -- [{"item":"후드집업 - 그레이","size":"L","qty":1}, ...] 상품 확인은 관리자 화면(lib/goods.ts lineError)
  items       jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 30),
  paid        boolean not null default false,                         -- 관리자가 입금 확인
  created_at  timestamptz not null default now()
);

alter table public.goods_orders enable row level security;

-- 주문은 누구나 10/21 까지 (한국 시간). 입금 확인 전 상태로만.
-- 조회/수정 정책은 일부러 없음: 관리자 페이지가 서버(api/admin)에서 서비스 키로만 접근.
drop policy if exists "누구나 주문" on public.goods_orders;
create policy "누구나 주문" on public.goods_orders
  for insert to anon, authenticated
  with check ((now() at time zone 'Asia/Seoul')::date <= date '2026-10-21' and not paid);
