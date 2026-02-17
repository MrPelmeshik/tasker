namespace TaskerApi.Constants;

/// <summary>
/// Константы сообщений об ошибках для единообразного использования в сервисах и маппинге исключений.
/// </summary>
public static class ErrorMessages
{
    /// <summary>Сообщение для ответа 404 (универсальное).</summary>
    public const string NotFoundGeneric = "Ресурс не найден";

    /// <summary>Внутренняя ошибка сервера (production).</summary>
    public const string InternalError = "Произошла внутренняя ошибка";

    /// <summary>Операция недоступна (production).</summary>
    public const string OperationUnavailable = "Операция недоступна";

    // ——— Доступ (Unauthorized) ———
    public const string AccessAreaDenied = "Доступ к области запрещен";
    public const string AccessAreaDeniedThis = "Доступ к данной области запрещен";
    public const string AccessTaskDenied = "Доступ к задаче запрещен";
    public const string AccessTaskDeniedThis = "Доступ к данной задаче запрещен";
    public const string AccessSubtaskDenied = "Доступ к данной подзадаче запрещен";
    public const string AccessFolderDenied = "Доступ к папке запрещен";
    public const string AccessTargetAreaDenied = "Доступ к целевой области запрещен";

    public const string NoPermissionCreateTasksInArea = "Нет прав на создание задач в области";
    public const string NoPermissionCreateTasks = "Нет прав на создание задач";
    public const string NoPermissionEditTask = "Нет прав на редактирование задачи";
    public const string NoPermissionEditTargetArea = "Нет прав на редактирование в целевой области";
    public const string NoPermissionEditFolder = "Нет прав на редактирование папки";
    public const string NoPermissionEditArea = "Нет прав на редактирование области";
    public const string NoPermissionAddActivity = "Нет прав на добавление записей по активности";
    public const string NoPermissionAddMembers = "Нет прав на назначение участников";
    public const string NoPermissionRemoveMembers = "Нет прав на удаление участников";

    public const string NoPermissionCreateFolders = "Нет прав на создание папок";

    public const string OnlyOwnerCanCreateFolders = "Только владелец области может создавать папки";
    public const string OnlyOwnerCanDeleteFolders = "Только владелец области может удалять папки";
    public const string OnlyOwnerCanDeleteTasks = "Только владелец области может удалять задачи";
    public const string OnlyOwnerCanDeleteArea = "Только владелец области может удалить область";
    public const string OnlyOwnerCanAssignAdmins = "Только владелец может назначать администраторов";
    public const string OnlyOwnerCanRemoveAdmin = "Только владелец может удалить администратора";
    public const string OnlyOwnerCanTransferOwner = "Только владелец может передать роль владельца";

    // ——— Не найдено (NotFound) ———
    public const string AreaNotFound = "Область не найдена";
    public const string TargetAreaNotFound = "Целевая область не найдена";
    public const string TaskNotFound = "Задача не найдена";
    public const string SubtaskNotFound = "Подзадача не найдена";
    public const string FolderNotFound = "Папка не найдена";
    public const string ParentFolderNotFound = "Родительская папка не найдена или принадлежит другой области";
    public const string TargetFolderNotFound = "Целевая папка не найдена или в другой области";
    public const string PurposeNotFound = "Цель не найдена";
    public const string UserNotFound = "Пользователь не найден";
    public const string UserLogNotFound = "Лог пользователя не найден";
    public const string MemberNotFound = "Участник не найден в области";
    public const string EventNotFound = "Событие не найдено";

    // ——— Валидация / бизнес-правила ———
    public const string AreaWithSameNameExists = "Область с таким названием уже существует";
    public const string UserWithSameNameExists = "Пользователь с таким именем уже существует";
    public const string UserWithSameEmailExists = "Пользователь с таким email уже существует";
    public const string FolderCannotBeParentOfItself = "Папка не может быть родителем самой себя";
    public const string FolderCycle = "Циклическая вложенность папок";
    public const string UseTransferOwnerEndpoint = "Для передачи роли владельца используйте эндпоинт transfer-owner";
    public const string SpecifyUserIdOrLogin = "Укажите UserId или Login";
    public const string CannotRemoveOwner = "Нельзя удалить владельца. Сначала передайте роль владельца другому пользователю";
    public const string UserAlreadyOwner = "Пользователь уже является владельцем";

    // ——— Даты (TaskService) ———
    public const string InvalidDateFrom = "Некорректная дата начала диапазона";
    public const string InvalidDateTo = "Некорректная дата конца диапазона";
    public const string DateToBeforeDateFrom = "Дата конца не может быть раньше даты начала";

    // ——— События/активности ———
    public const string EventDateRequired = "Дата события/активности обязательна";
    public const string EventDateFormatInvalid = "Некорректный формат даты события";

    // ——— Аутентификация ———
    public const string InvalidLoginOrPassword = "Неверный логин или пароль";
    public const string AccountBlocked = "Аккаунт заблокирован";
    public const string RefreshTokenInvalidOrRevoked = "Неверный или отозванный refresh токен";
    public const string RefreshTokenInvalid = "Неверный refresh токен";
    public const string RefreshTokenMissing = "Refresh токен отсутствует";
    public const string TokenInvalidOrExpired = "Неверный или просроченный токен";
    public const string TokenInvalid = "Неверный токен";
    public const string TokenNotProvided = "Токен доступа не предоставлен";
    public const string TokenInvalidForProfile = "Токен доступа недействителен";
    public const string ValidationError = "Ошибка валидации";
    public const string UsernameTaken = "Имя пользователя уже занято";
    public const string EmailInUse = "Email уже используется";
    public const string WrongCurrentPassword = "Неверный текущий пароль";
    public const string CurrentPasswordRequiredForChange = "Для смены пароля укажите текущий пароль";
    public const string LoginTaken = "Логин уже занят";
    public const string RequestBodyEmpty = "Тело запроса не должно быть пустым";

    /// <summary>
    /// Проверяет, является ли сообщение исключения одним из «не найден» (для маппинга в 404).
    /// </summary>
    public static bool IsNotFound(string? message)
    {
        if (string.IsNullOrEmpty(message)) return false;
        return message == AreaNotFound || message == TargetAreaNotFound
            || message == TaskNotFound || message == SubtaskNotFound
            || message == FolderNotFound || message == ParentFolderNotFound || message == TargetFolderNotFound
            || message == PurposeNotFound || message == UserNotFound || message == UserLogNotFound
            || message == MemberNotFound || message == EventNotFound;
    }
}
