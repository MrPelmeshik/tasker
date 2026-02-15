alter table tasks
add column parent_task_id uuid null;

alter table tasks
add constraint fk_tasks_parent_task_id
foreign key (parent_task_id)
references tasks (id)
on delete restrict;

create index ix_tasks_parent_task_id on tasks (parent_task_id);
