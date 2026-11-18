-- Leve: acesso Premium por compra da Hotmart.
-- Rode uma vez no SQL Editor do Supabase.
-- As tabelas ficam fechadas (RLS sem políticas): só as funções do servidor acessam.

create table if not exists public.purchases (
  transaction  text primary key,            -- código da transação Hotmart (HP...)
  email        text not null,               -- e-mail do comprador, em minúsculas
  name         text,
  product_id   text,
  status       text not null default 'active', -- active | revoked
  last_event   text,
  approved_at  timestamptz,
  expires_at   timestamptz,
  updated_at   timestamptz not null default now()
);
create index if not exists purchases_email_idx on public.purchases (email);

create table if not exists public.devices (
  token_hash   text primary key,            -- sha-256 do token guardado no celular
  transaction  text not null references public.purchases(transaction) on delete cascade,
  label        text,
  created_at   timestamptz not null default now(),
  last_seen    timestamptz not null default now()
);
create index if not exists devices_tx_idx on public.devices (transaction);

create table if not exists public.webhook_log (
  id           bigint generated always as identity primary key,
  received_at  timestamptz not null default now(),
  event        text,
  transaction  text,
  ok           boolean,
  note         text
);

create table if not exists public.activation_attempts (
  id           bigint generated always as identity primary key,
  at           timestamptz not null default now(),
  ip           text,
  ok           boolean
);
create index if not exists activation_attempts_ip_idx on public.activation_attempts (ip, at);

alter table public.purchases enable row level security;
alter table public.devices enable row level security;
alter table public.webhook_log enable row level security;
alter table public.activation_attempts enable row level security;
