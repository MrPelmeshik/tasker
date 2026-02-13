-- Таблица refresh_tokens для инвалидации при logout
-- Миграция: 0013.refresh_tokens.sql

create table if not exists refresh_tokens (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    token_hash varchar(64) not null,
    expires_at timestamptz not null,
    revoked boolean not null default false,
    created_at timestamptz not null default now()
);

create unique index if not exists idx_refresh_tokens_token_hash on refresh_tokens(token_hash);
create index if not exists idx_refresh_tokens_user_id on refresh_tokens(user_id);
create index if not exists idx_refresh_tokens_expires_at on refresh_tokens(expires_at);

comment on table refresh_tokens is 'Refresh-токены для инвалидации при logout';
comment on column refresh_tokens.token_hash is 'SHA256 hash токена';
comment on column refresh_tokens.revoked is 'Признак отзыва (logout)';
