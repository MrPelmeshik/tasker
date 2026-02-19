-- Цвет папки хранится в таблице folders.
-- Миграция: 0019.add_folders_color.sql

alter table folders add column if not exists color varchar(9);

comment on column folders.color is 'Цвет папки (hex, например #ff0000). Если null — используется цвет области.';
