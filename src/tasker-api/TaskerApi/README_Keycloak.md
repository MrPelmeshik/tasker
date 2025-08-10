# Настройка авторизации через Keycloak

## Требования
- Keycloak Server (версия 21+)
- .NET 8.0

## Настройка Keycloak

### 1. Установка Keycloak
```bash
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
```

### 2. Создание Client
1. Откройте http://localhost:8080
2. Создайте realm "tasker"
3. Создайте client "tasker-api" с типом "confidential"
4. Скопируйте Client Secret

### 3. Создание ролей
- admin
- manager  
- user

## Настройка API

### appsettings.json
```json
{
  "Keycloak": {
    "Authority": "http://localhost:8080/realms/tasker",
    "Audience": "tasker-api",
    "ClientId": "tasker-api",
    "ClientSecret": "your-secret",
    "RequireHttpsMetadata": false
  }
}
```

## Использование

### Авторизация
```csharp
[Authorize] // Требует авторизации
[Authorize("admin")] // Требует роль
```

### Получение токена
```bash
curl -X POST http://localhost:8080/realms/tasker/protocol/openid-connect/token \
  -d "grant_type=password&client_id=tasker-api&username=user&password=pass"
```

### Использование токена
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/projects
``` 