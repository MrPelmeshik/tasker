export const CONFIRM_UNSAVED_CHANGES = {
  title: 'Несохраненные изменения',
  message: 'У вас есть несохраненные изменения. Что вы хотите сделать?',
  confirmText: 'Сохранить',
  cancelText: 'Отмена',
  discardText: 'Не сохранять',
  showDiscard: true as const,
};

export const CONFIRM_RETURN_TO_VIEW = {
  title: 'Вернуться к просмотру',
  message: 'Есть несохранённые изменения. Вернуться к просмотру без сохранения?',
  confirmText: 'Да',
  cancelText: 'Нет',
};

export function getConfirmDeleteConfig(entityName: string) {
  return {
    title: `Удалить ${entityName}`,
    message: `Вы уверены, что хотите удалить эту ${entityName}? Запись будет деактивирована и скрыта из списков.`,
    confirmText: 'Удалить',
    cancelText: 'Отмена',
    variant: 'danger' as const,
  };
}
