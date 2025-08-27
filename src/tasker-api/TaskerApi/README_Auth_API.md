# Tasker API - Авторизация и регистрация через Keycloak

## Обзор

Данный API предоставляет функциональность для авторизации и регистрации пользователей через Keycloak. Реализованы все основные операции аутентификации с использованием JWT токенов.

## Возможности

- ✅ Регистрация новых пользователей
- ✅ Авторизация пользователей
- ✅ Обновление токенов доступа
- ✅ Выход из системы
- ✅ Получение информации о текущем пользователе
- ✅ Проверка состояния авторизации
- ✅ Извлечение ролей из JWT токенов
- ✅ Валидация токенов
- ✅ Логирование всех операций

## Архитектура

### Слои приложения

1. **Controllers** - HTTP API эндпоинты
2. **Services** - Бизнес-логика авторизации
3. **Providers** - Взаимодействие с Keycloak API
4. **Models** - DTO для запросов и ответов
5. **Interfaces** - Контракты для сервисов и провайдеров

### Основные компоненты

- `AuthController` - Контроллер API авторизации
- `AuthService` - Сервис авторизации
- `KeycloakProvider` - Провайдер для работы с Keycloak
- `IAuthService` - Интерфейс сервиса авторизации
- `IKeycloakProvider` - Интерфейс провайдера Keycloak

## Настройка Keycloak

### 1. Создание Realm

1. Войдите в админ-консоль Keycloak
2. Создайте новый realm с именем `tasker`
3. Настройте realm согласно вашим требованиям

### 2. Создание Client

1. В разделе Clients создайте новый client
2. Установите Client ID: `tasker-api`
3. Установите Client Protocol: `openid-connect`
4. В настройках Access Type выберите `confidential`
5. Включите Direct Access Grants
6. Сохраните изменения

### 3. Настройка Client Credentials

1. Перейдите на вкладку Credentials
2. Скопируйте Client Secret
3. Обновите `appsettings.json` с полученным секретом

### 4. Настройка Client Scopes

1. Перейдите на вкладку Client Scopes
2. Убедитесь, что включены:
   - `openid`
   - `profile`
   - `email`
   - `roles`

### 5. Создание ролей (опционально)

1. В разделе Roles создайте роли:
   - `admin` - для администраторов
   - `manager` - для менеджеров
   - `user` - для обычных пользователей

## Конфигурация

### appsettings.json

```json
{
  "Keycloak": {
    "Authority": "http://localhost:8080/realms/tasker",
    "Audience": "tasker-api",
    "ClientId": "tasker-api",
    "ClientSecret": "your-actual-client-secret",
    "RequireHttpsMetadata": false,
    "ValidateIssuer": true,
    "ValidateAudience": true,
    "ValidateLifetime": true,
    "ValidateIssuerSigningKey": true
  }
}
```

### Переменные окружения

Для продакшена рекомендуется использовать переменные окружения:

```bash
KEYCLOAK__AUTHORITY=https://your-keycloak.com/realms/tasker
KEYCLOAK__AUDIENCE=tasker-api
KEYCLOAK__CLIENTID=tasker-api
KEYCLOAK__CLIENTSECRET=your-secret
KEYCLOAK__REQUIREHTTPSMETADATA=true
```

## API Endpoints

### 1. Регистрация пользователя

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "testuser@example.com",
  "firstName": "Иван",
  "lastName": "Иванов",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Регистрация выполнена успешно",
  "data": {
    "userId": "generated-user-id",
    "message": "Пользователь успешно зарегистрирован"
  }
}
```

### 2. Авторизация пользователя

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Авторизация выполнена успешно",
  "data": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token",
    "tokenType": "Bearer",
    "expiresIn": 300,
    "userInfo": {
      "id": "user-id",
      "username": "testuser",
      "email": "testuser@example.com",
      "firstName": "Иван",
      "lastName": "Иванов",
      "roles": ["user"]
    }
  }
}
```

### 3. Обновление токена

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### 4. Получение информации о пользователе

```http
GET /api/auth/me
Authorization: Bearer your-access-token
```

### 5. Проверка состояния авторизации

```http
GET /api/auth/status
Authorization: Bearer your-access-token
```

### 6. Выход из системы

```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

## Безопасность

### JWT Токены

- **Access Token** - короткоживущий токен для доступа к API
- **Refresh Token** - долгоживущий токен для обновления access token
- Токены содержат информацию о пользователе и его ролях
- Подпись токенов проверяется с использованием публичных ключей Keycloak

### Валидация

- Проверка издателя (issuer)
- Проверка аудитории (audience)
- Проверка времени жизни токена
- Проверка подписи токена

### Роли и разрешения

- Роли извлекаются из JWT токена
- Поддержка realm ролей и client ролей
- Автоматическое маппирование ролей в ASP.NET Core Claims

## Логирование

Все операции авторизации логируются с использованием ILogger:

- Успешные операции (Information)
- Ошибки валидации (Warning)
- Системные ошибки (Error)

## Обработка ошибок

API возвращает структурированные ответы с информацией об ошибках:

```json
{
  "success": false,
  "message": "Описание ошибки",
  "errors": ["Детали ошибки 1", "Детали ошибки 2"]
}
```

## Тестирование

### Использование Swagger

1. Запустите приложение
2. Откройте Swagger UI: `/swagger`
3. Протестируйте все эндпоинты

### Использование HTTP файла

В проекте есть файл `Auth_API_Examples.http` с примерами запросов для тестирования.

### Postman

1. Импортируйте примеры из HTTP файла
2. Настройте переменные окружения
3. Протестируйте все эндпоинты

## Мониторинг и отладка

### Логи

- Все операции логируются в структурированном виде
- Используйте фильтры по уровню логирования для отладки

### Swagger

- Автоматическая документация API
- Интерактивное тестирование эндпоинтов
- Примеры запросов и ответов

## Производительность

### Кэширование

- Токены администратора кэшируются для создания пользователей
- HTTP клиент переиспользуется для запросов к Keycloak

### Асинхронность

- Все операции выполняются асинхронно
- Неблокирующие вызовы к Keycloak API

## Развертывание

### Docker

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
COPY . /app
WORKDIR /app
EXPOSE 80
ENTRYPOINT ["dotnet", "TaskerApi.dll"]
```

### Переменные окружения

Убедитесь, что все необходимые переменные окружения настроены в контейнере.

## Устранение неполадок

### Частые проблемы

1. **Ошибка валидации токена**
   - Проверьте настройки Keycloak
   - Убедитесь, что публичные ключи доступны

2. **Ошибка создания пользователя**
   - Проверьте права доступа клиента
   - Убедитесь, что client secret корректный

3. **Ошибка подключения к Keycloak**
   - Проверьте доступность Keycloak сервера
   - Проверьте настройки сети

### Логи

Проверьте логи приложения для диагностики проблем:

```bash
docker logs your-container-name
```

## Дополнительные возможности

### Расширение ролей

Для добавления новых ролей:

1. Создайте роли в Keycloak
2. Обновите политики авторизации в `Program.cs`
3. Добавьте новые эндпоинты с соответствующими атрибутами `[Authorize(Roles = "new-role")]`

### Кастомные claims

Для добавления кастомных claims:

1. Настройте маппинг в Keycloak
2. Обновите логику извлечения в `AuthService.ExtractRolesFromToken`

### Webhook уведомления

Для интеграции с внешними системами можно добавить webhook уведомления о событиях авторизации.

## Поддержка

При возникновении проблем:

1. Проверьте логи приложения
2. Проверьте настройки Keycloak
3. Убедитесь в корректности конфигурации
4. Проверьте сетевую доступность

## Лицензия

Данный код распространяется под лицензией проекта.
