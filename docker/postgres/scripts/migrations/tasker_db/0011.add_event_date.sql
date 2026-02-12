-- Добавление колонки event_date в таблицу events
-- Миграция: 0011.add_event_date.sql
-- Дата события/активности (обязательное поле для отображения и учёта в недельной сводке)

alter table events add column if not exists event_date timestamptz;

-- Проставляем дату создания для существующих записей
update events set event_date = created_at where event_date is null;

-- Делаем поле обязательным
alter table events alter column event_date set not null;

comment on column events.event_date is 'Дата события/активности';
