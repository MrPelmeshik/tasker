-- Смена типа поля description на JSONB в таблице events
-- Миграция: 0008.events_description_to_message_jsonb.sql

-- Изменение типа на JSONB с конвертацией существующих данных
ALTER TABLE events ALTER COLUMN description TYPE jsonb USING (
  CASE
    WHEN description IS NULL OR trim(description) = '' THEN NULL
    ELSE jsonb_build_object('text', description)
  END
);

-- Комментарий к колонке
COMMENT ON COLUMN events.description IS 'Сообщение события в формате JSON (детализация)';
