create table if not exists attachments (
    id uuid primary key,
    original_file_name text not null,
    storage_file_name text not null,
    content_type text not null,
    size bigint not null,
    entity_id uuid not null,
    entity_type integer not null,
    created_at timestamptz not null,
    owner_user_id uuid not null,
    deactivated_at timestamptz,
    is_active boolean not null,
    updated_at timestamptz not null
);

create index ix_attachments_entity_id on attachments (entity_id);
create index ix_attachments_owner_user_id on attachments (owner_user_id);

COMMENT ON TABLE attachments IS 'Вложения (файлы), прикрепленные к сущностям';
COMMENT ON COLUMN attachments.id IS 'Идентификатор вложения';
COMMENT ON COLUMN attachments.original_file_name IS 'Оригинальное имя файла при загрузке';
COMMENT ON COLUMN attachments.storage_file_name IS 'Имя файла в хранилище (обычно GUID + расширение)';
COMMENT ON COLUMN attachments.content_type IS 'MIME-тип файла';
COMMENT ON COLUMN attachments.size IS 'Размер файла в байтах';
COMMENT ON COLUMN attachments.entity_id IS 'Идентификатор сущности, к которой прикреплен файл';
COMMENT ON COLUMN attachments.entity_type IS 'Тип сущности (0-Area, 1-Folder, 2-Task, 3-Event)';
COMMENT ON COLUMN attachments.owner_user_id IS 'Идентификатор пользователя, загрузившего файл';
COMMENT ON COLUMN attachments.created_at IS 'Дата создания записи';
COMMENT ON COLUMN attachments.updated_at IS 'Дата последнего обновления записи';
COMMENT ON COLUMN attachments.is_active IS 'Флаг активности (false - удален)';
COMMENT ON COLUMN attachments.deactivated_at IS 'Дата деактивации (удаления)';
COMMENT ON COLUMN attachments.updated_at IS 'Дата последнего обновления';
