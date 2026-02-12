-- Ролевая модель доступа к областям
-- Роли: creator, administrator, executor, observer

alter table user_area_access add column if not exists role text not null default 'administrator';

comment on column user_area_access.role is 'Роль пользователя в области: creator, administrator, executor, observer';

-- Миграция существующих данных: записи создателя области получают роль creator
update user_area_access uaa
set role = 'creator'
from areas a
where uaa.area_id = a.id
  and uaa.user_id = a.creator_user_id
  and uaa.is_active = true;


-- Уникальный частичный индекс: один creator на область
create unique index if not exists unique_creator_per_area
    on user_area_access(area_id)
    where role = 'creator';
