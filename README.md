## Настройка проекта

### Настройка переменных окружения

В корне проекта создать файл `.env` и наполнить переменными окружения:
```
# Database
DB_PG_PWD_POSTGRES=your_postgres_password

# JWT Settings
JWT_SECRET_KEY=your_jwt_secret_key_here_must_be_at_least_32_characters_long
JWT_ISSUER=TaskerAPI
JWT_AUDIENCE=TaskerApp
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# ASP.NET Core
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://+:8080

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# React App
REACT_APP_API_BASE=http://localhost:8080/api
```

### Применение миграций

При первом запуске проекта или при внесении изменений в БД через миграции необходимо выполнить руками скрипты миграций по порядку из директорий:
1. Postgres: `.\docker\postgres\scripts`. За исключение (вложенной) директории `.\docker\postgres\scripts\init`
2. ClickHouse: `.\docker\clickhouse\scripts`

---

## Запуск

### Подсказки по docker-compose:
* docker-compose up — запускает приложение со всеми контейнеры, информация о которых есть в docker-compose.yml. Если файл не указан, по умолчанию используется файл в текущем каталоге;
* docker-compose down — останавливает и удаляет все контейнеры, а также тома, связанные с ними;
* docker-compose start — запускает остановленные контейнеры;
* docker-compose stop — останавливает работу запущенных контейнеров без их удаления;
* docker-compose restart — перезапускает контейнеры;
* docker-compose build — позволяет обновить образы или создать их заново, если они были изменены;
* docker-compose logs — выводит журналы состояния;
* docker-compose ps — отображает текущее состояние контейнеров;
* docker-compose pull — загружает последние версии образов для сервисов, описанных в файле docker-compose.yml

### Если не проходит "ребилд" `docker-compose up --build`
1. Перезапустить Docker
2. Повторить выполнение команды `docker-compose up --build`

---

## Переменные окружения для сервера (TaskerApi)

Обязательные/рекомендуемые переменные для продакшена:

```
# Базовые
ASPNETCORE_ENVIRONMENT=Production
# При необходимости: на каких адресах слушать
# ASPNETCORE_URLS=http://0.0.0.0:5000;https://0.0.0.0:5001

# JWT
Jwt__Issuer=TaskerApi
Jwt__Audience=TaskerApiAudience
# Секрет длиной 32+ символов (случайный)
Jwt__SecretKey=CHANGE_ME_TO_A_LONG_RANDOM_SECRET_32+_CHARS
Jwt__AccessTokenLifetimeMinutes=60
Jwt__RefreshTokenLifetimeDays=7

# CORS (разрешённые Origin для фронтенда). Укажите конкретные URL через CSV
Cors__AllowedOriginsCsv=https://your-frontend.example.com,http://localhost:3000
# Либо массивом в appsettings.json -> Cors:AllowedOrigins

# База данных
# Вариант 1: задать пароль, если используется плейсхолдер из appsettings.json
PWD_PG_DB_POSTGRES=...
# Вариант 2: переопределить всю строку подключения напрямую (имеет приоритет над appsettings)
# Database__ConnectionString=Host=postgres;Port=5432;Database=tasker_db;Username=postgres;Password=...
```

Замечания:
- Для httpOnly refresh-cookie включён `SameSite=Lax`, `Path=/api/auth`, `Secure=true` при HTTPS. В продакшене используйте HTTPS, иначе cookie с `Secure` не будет отправляться.
- Если фронт и бэкенд на разных доменах/портах, обязательно укажите точные Origins в `Cors__AllowedOriginsCsv` и вызывайте запросы с `credentials: 'include'` на фронте (уже настроено в клиенте для login/refresh/logout).

## Переменные окружения для фронтенда (tasker-app)

Создайте `src/tasker-app/.env` (или задайте переменные на хостинге):

```
# Базовый URL API (с префиксом /api)
REACT_APP_API_BASE=https://api.example.com/api
```

Примечания по аутентификации:
- Фронт хранит только access-токен (в sessionStorage). Refresh-токен хранится на стороне сервера в httpOnly cookie и не доступен JS.
- Вызовы `/auth/login`, `/auth/refresh`, `/auth/logout` отправляются с `credentials: 'include'` для обмена cookie.

### Real-time обновления (SignalR WebSocket)

Приложение использует SignalR для push-уведомлений об изменениях. Hub доступен по пути `/hubs/tasker` (на том же хосте, что и REST API, без префикса `/api`).

**REACT_APP_API_BASE:** можно указать с `/api` (например `http://localhost:8080/api`) или без — клиент автоматически формирует URL Hub.

---

## Настройка reverse proxy для WebSocket

При развёртывании за Nginx или другим reverse proxy необходимо настроить поддержку WebSocket для пути `/hubs/`:

**Nginx:**
```nginx
location /hubs/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
    proxy_pass http://backend;
}
```

**Kubernetes Ingress (аннотация):**
```yaml
nginx.ingress.kubernetes.io/proxy-read-timeout: "86400"
nginx.ingress.kubernetes.io/proxy-send-timeout: "86400"
```

При использовании внешнего балансировщика (AWS ALB, CloudFlare и т.п.) необходимо включить поддержку WebSocket.

---

## Масштабирование (несколько реплик API)

SignalR по умолчанию держит состояние в памяти. При нескольких репликах API возможны два подхода:

1. **Sticky sessions:** Настроить балансировщик так, чтобы один клиент всегда попадал на одну реплику (например, nginx `ip_hash`, Kubernetes `sessionAffinity: ClientIP`).

2. **Redis backplane:** `services.AddSignalR().AddStackExchangeRedis(...)` — сообщения рассылаются между репликами через Redis.

---

## Рекомендации

- Рекомендуется не открывать чрезмерное количество вкладок с приложением одновременно (например, >10).