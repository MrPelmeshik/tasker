-- Переименование creator (создатель) в owner (владелец)
-- Миграция: 0010.rename_creator_to_owner.sql

-- areas
alter table areas rename column creator_user_id to owner_user_id;
comment on column areas.owner_user_id is 'ID владельца';

-- groups
alter table groups rename column creator_user_id to owner_user_id;
comment on column groups.owner_user_id is 'ID владельца';

-- tasks
alter table tasks rename column creator_user_id to owner_user_id;
comment on column tasks.owner_user_id is 'ID владельца';

-- subtasks
alter table subtasks rename column creator_user_id to owner_user_id;
comment on column subtasks.owner_user_id is 'ID владельца';

-- purposes
alter table purposes rename column creator_user_id to owner_user_id;
comment on column purposes.owner_user_id is 'ID владельца';

-- events
alter table events rename column creator_user_id to owner_user_id;
comment on column events.owner_user_id is 'ID владельца';

-- events_2_tasks
alter table events_2_tasks rename column creator_user_id to owner_user_id;
alter index idx_events_2_tasks_creator_user_id rename to idx_events_2_tasks_owner_user_id;
comment on column events_2_tasks.owner_user_id is 'ID владельца';

-- events_2_subtasks
alter table events_2_subtasks rename column creator_user_id to owner_user_id;
alter index idx_events_2_subtasks_creator_user_id rename to idx_events_2_subtasks_owner_user_id;
comment on column events_2_subtasks.owner_user_id is 'ID владельца';

-- events_2_groups
alter table events_2_groups rename column creator_user_id to owner_user_id;
alter index idx_events_2_groups_creator_user_id rename to idx_events_2_groups_owner_user_id;
comment on column events_2_groups.owner_user_id is 'ID владельца';

-- events_2_areas
alter table events_2_areas rename column creator_user_id to owner_user_id;
alter index idx_events_2_areas_creator_user_id rename to idx_events_2_areas_owner_user_id;
comment on column events_2_areas.owner_user_id is 'ID владельца';

-- events_2_purposes
alter table events_2_purposes rename column creator_user_id to owner_user_id;
alter index idx_events_2_purposes_creator_user_id rename to idx_events_2_purposes_owner_user_id;
comment on column events_2_purposes.owner_user_id is 'ID владельца';

-- user_area_access: роль creator -> owner
update user_area_access set role = 'owner' where role = 'creator';

drop index if exists unique_creator_per_area;
create unique index if not exists unique_owner_per_area
    on user_area_access(area_id)
    where role = 'owner';

comment on column user_area_access.role is 'Роль пользователя в области';
