# WorkStream Collaborative Platform

Мульти-воркспейсное приложение, где команды (workspaces) создают каналы для чата и запускают фоновые задач (job queue) — например, обработка файлов, экспорт данных, периодические отчёты. Включено: права доступа, вебхуки/OAuth интеграции, электронная почта уведомлений, кеширование результатов, realtime чат/уведомления через Socket.IO (namespaces per workspace/channel). Фронтенд — минимальная админка/панель для демонстрации функционала.

## План

**Цели:**

- [x] Инициализация репозитория + Docker Compose (postgres, redis).
  - [x] Database: `docker run --name postgresql -e POSTGRES_PASSWORD=admin -e POSTGRES_USER=admin -e POSTGRES_DB=postgresql -p 5432:5432 -d postgres`
  - [x] Redis: `docker run --name redis -p 6379:6379 -d redis`
- [x] Настройка
  - [x] npm init -y
- [x] Реализовать модели Sequelize (User, Workspace, Member, Channel, Message, Job).
  - [x] Настроить соединение с базой PostgreSQL
    - [x] `npm install sequelize pg`
    - [x] `npm install --save-dev @types/sequelize`
  - [x] Создать **модели** (User, Workspace, Member, Channel, Message, Job).
  - [x] Описать связи между ними.
  - [ ] (Позже) — синхронизировать их с базой и начать использовать в API.
- [ ] Регистрация/вход (hash пароля bcrypt), JWT access+refresh, refresh rotation (хранить refresh в DB).
  - [x] env окружение
  - [x] Регистрация новых пользователей
  - [x] Авторизация пользователя
- [ ] CRUD для workspace и channels.
- [ ] Минимальный фронтенд: страницы логина/регистрации + dashboard (список workspaces) — Formik + MUI, RTK Query набросать базовые hooks.

## Функции:

- [ ] Регистрация/вход (email+пароль) + JWT access/refresh.
- [ ] Workspaces: создать/редактировать/пригласить участников (роль owner/admin/member).
- [ ] Каналы в workspace: публичные/приватные.
- [ ] Realtime чат внутри channel (Socket.IO namespaces: `/ws:{workspaceId}/channel:{channelId}`) — сообщения сохраняются в PostgreSQL.
- [ ] Job queue: пользователь запускает задачу (например, «экспорт CSV» или «фейковая обработка»). BullMQ обрабатывает задачи, статус виден в UI, прогресс пушится через Socket.IO.
- [ ] Redis:
  * кеш списка каналов / метаданных workspace для быстрой загрузки.
  * хранение сессий/refresh token blacklist/rotation.
- [ ] OAuth-интеграция (пример: подключение Google Drive или GitHub для демонстрации) — flow для получения токена интеграции и сохранения в PostgreSQL (шифровать).
- [ ] Email уведомления (Nodemailer + SMTP/SES): письмо при завершении job и приглашения в workspace.
- [ ] Минимальный frontend: страницы для логина/регистрации, dashboard (список workspaces), workspace view (список каналов, чат), панель запуска jobs + статус. Использовать Next.js App Router, TypeScript, MUI + Formik формы, Redux Toolkit + RTK Query для API, socket.io-client для realtime, i18n (next-i18next или next-intl) — импорт переводов из Google Sheets можно предусмотреть как JSON импортный скрипт (минимально реализовать).


## Миграции

- [x] Migration file: `sequelize migration:generate --name create-tables`
- [x] sequelize db:migrate
- [x] sequelize db:migrate:undo

## Архитектура / Компоненты

* **DB:** PostgreSQL (Sequelize ORM)
* **Cache:** Redis
* **Queue:** BullMQ (workers запускаются отдельно или в другом процессе)
* **Realtime:** Socket.IO (на том же сервере, namespace per workspace/channel)
* **Auth:** JWT (access short lived \~15m, refresh long lived \~7–30d) + refresh token rotation stored in Redis or DB
* **Email:** Nodemailer with SMTP or AWS SES
* **Docker:** docker-compose для локальной среды (postgres, redis, app, worker)

# DB схема (основные таблицы)

Приведу кратко основные модели Sequelize.

**User**

* id (uuid)
* email (string, unique)
* passwordHash (string)
* name (string, unique)
* createdAt, updatedAt

**Workspace**

* id (uuid)
* name (string)
* ownerId (FK → User)
* createdAt, updatedAt

**WorkspaceMember**

* id
* userId
* workspaceId
* role ('owner'|'admin'|'member')

**Channel**

* id
* workspaceId
* name
* isPrivate (boolean)
* createdAt

**Message**

* id
* channelId
* userId
* text (text)
* metadata (json) — attachments, etc.
* createdAt

**OAuthIntegration**

* id
* workspaceId
* provider ('google'|'github'|...)
* accessToken (encrypted)
* refreshToken (encrypted)
* scope, expiresAt

**Job**

* id (uuid)
* workspaceId
* initiatedBy (userId)
* type (string) — 'export_csv' etc.
* status ('queued'|'active'|'completed'|'failed')
* progress (int 0–100)
* resultUrl (string) // where CSV stored (optional)
* meta json
* createdAt, updatedAt

**RefreshToken (optionally)**

* id
* userId
* tokenHash
* revoked (bool)
* expiresAt


