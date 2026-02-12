-- Добавление колонки event_date в таблицу events
-- Миграция: 0011.add_event_date.sql
-- Дата события/активности (для отображения и учёта в недельной сводке)

alter table events add column if not exists event_date timestamptz;
comment on column events.event_date is 'Дата события/активности';
