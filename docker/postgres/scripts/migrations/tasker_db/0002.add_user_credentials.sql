alter table if exists users
    add column if not exists email text,
    add column if not exists first_name text,
    add column if not exists last_name text,
    add column if not exists password_hash text,
    add column if not exists password_salt text;

create unique index if not exists uq_users_email on users((lower(email))) where email is not null;
create unique index if not exists uq_users_name on users((lower(name)));

comment on column users.email is 'Email пользователя';
comment on column users.first_name is 'Имя';
comment on column users.last_name is 'Фамилия';
comment on column users.password_hash is 'Хеш пароля';
comment on column users.password_salt is 'Соль пароля';


