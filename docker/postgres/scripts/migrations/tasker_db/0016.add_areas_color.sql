-- Цвет области хранится в таблице areas.
-- Миграция: 0016.add_areas_color.sql

alter table areas add column if not exists color varchar(9);

comment on column areas.color is 'Цвет области (hex, например #ff0000)';
