# eddytester-landing — сайт API Практикума

## Что это

Лендинг продукта «API Практикум» (https://eddytester.com/api-practicum).
Исходник — Tilda-экспорт (`page101918416.html`). Хостится на Timeweb через Apache.

## Архитектура

- **Файл:** `page101918416.html` — Tilda Zero Block HTML (главная страница, она же лендинг)
- **Директория на сервере:** `/var/www/eddytester.com/`
- **Apache:** VirtualHost eddytester.com, порт 80, DirectoryIndex `page101918416.html`
- **RewriteRule:** `/api-practicum` → `page101918416.html`

Другие страницы: `page64392263.html` (главная сайта), `page*html` (оферта, политика и т.д.)

## Статус деплоя

- **GitHub (origin):** `https://github.com/overgoer/eddytester`
- **Нет CI/CD** — автодеплоя при мерже нет, деплой всегда ручной
- Деплой на сервер — SCP файла на Timeweb, **но только из main и только через Git-workflow ниже**

## Жёсткое правило: только Git, никакого SCP в обход

Любое изменение сайта — **только через Git**. SCP напрямую на сервер запрещён.

### Полный workflow

```bash
# 1. Убедиться, что main — это то, что на сервере
#    (если нет — сначала синхронизировать)

# 2. Создать бэкап main перед изменениями
git checkout main
git tag backup/YYYY-MM-DD  # например: backup/2026-05-28
git push origin --tags

# 3. Создать ветку для изменений от main
git checkout -b fix/название-правки

# 4. Внести изменения, закоммитить
git add page101918416.html
git commit -m "fix: что сделано"
git push origin fix/название-правки

# 5. Протестировать на тестовой странице
#    Задеплоить ветку на test.html:
scp -P 2222 page101918416.html root@85.193.81.51:/var/www/eddytester.com/test.html
#    Проверить: https://eddytester.com/test.html
#    Если не ок — править, коммитить, повторно залить на test.html

# 6. После успешного теста — смержить в main
git checkout main
git merge fix/название-правки
git push origin main

# 7. Задеплоить main на сервер
scp -P 2222 page101918416.html root@85.193.81.51:/var/www/eddytester.com/page101918416.html

# 8. Удалить тестовую страницу (чтобы не плодить мусор)
ssh -p 2222 root@85.193.81.51 "rm /var/www/eddytester.com/test.html"

# 9. Удалить ветку
git branch -d fix/название-правки
git push origin --delete fix/название-правки
```

### Коротко (памятка)

| Шаг | Действие |
|---|---|
| 1 | `git tag backup/YYYY-MM-DD` на main |
| 2 | Новая ветка от main |
| 3 | Правки → коммит → пуш |
| 4 | Деплой на `test.html` для проверки |
| 5 | Мерж в main → пуш |
| 6 | Деплой main на сервер |
| 7 | Удалить `test.html`, удалить ветку |

### Что нельзя делать

- **Нельзя** менять файл и заливать SCP без коммита
- **Нельзя** работать в main напрямую
- **Нельзя** деплоить на `page101918416.html` без предварительного теста на `test.html`
- **Нельзя** удалять чужие `page*.html` файлы

### Подключение к серверу

```bash
ssh timeweb
# или: ssh -p 2222 root@85.193.81.51
```

### Типы блоков в Tilda-экспорте

1. **Обычные блоки** (t050, t142, t225, t847, t858) — HTML в `<div>`, легко редактировать
2. **Zero Block** (t396) — позиционирование в JS (`t396_init`), текст в `tn-atom` внутри long-line HTML

## Важные моменты

- **Не удалять** другие `page*.html` — они используются как отдельные страницы
- **CSS/JS/images** лежат в соответствующих папках (ссылаются из Tilda-экспорта)
- **Баги в v1 API — учебные, не чинить** (проект `v0-test-api`)
- **Prodamus** настроен на `eddytester.payform.ru`, виджет ещё не встроен

## Связь с продуктом

- **Telegram бот:** https://t.me/api_praktikum_bot (воронка: 4 задачи → прогрев → оффер)
- **Free Trial API:** отдельный микросервис на Timeweb (генерация 24ч ключей)
- **Основное API (v0-test-api):** Express + PostgreSQL, учебный стенд с 30+ багами
- **Цена:** Early Bird 2 900₽ (вместо 4 990₽) — единая с ботом

## Что не трогать

- Другие проекты на сервере (Telegram боты, Free Trial API и т.д.)
- `.env` файлы с реальными ключами

## Бэклог

### 1. SSL (Let's Encrypt) — HTTPS для eddytester.com

**Цель:** сайт работает по HTTPS, сертификат обновляется сам, при сбое/успехе — уведомление.

**План:**
- Установить Certbot + Apache-плагин
- Выпустить сертификат на `eddytester.com` и `www.eddytester.com`
- Настроить автоматический редирект HTTP → HTTPS
- Убедиться, что systemd-таймер certbot включён и работает
- Сделать уведомления через Telegram-бота (бот @api_praktikum_bot уже есть — тот же сервер)

**Уведомления (критично):**
- Certbot умеет хуки `--renew-hook` и `--pre-hook`
- Сделать скрипт, который дёргает Telegram API в хуках:
  - `--pre-hook` не нужен (certbot сам всё делает)
  - `--renew-hook` → шлёт "✅ SSL обновлён, действителен до YYYY-MM-DD"
  - Если таймер не сработал или certbot упал — мониторинг через `cron` раз в неделю проверяет дату expiry и шлёт уведомление если осталось <30 дней

**Проверка:**
- `certbot renew --dry-run` — имитация обновления
- Проверить `systemctl status certbot.timer`
- Посмотреть `/var/log/letsencrypt/` при следующем срабатывании

### 2. Уборка на сервере

- Удалить `/var/www/eddytester.com/page101918416.html.bak`
- Удалить `/var/www/eddytester.com/test.html`
- Удалить `readme.txt`

### 3. Тестирование изменений (вместо пароля)

При изменениях лендинга:
1. Проверять локально — открыть HTML-файл в браузере (Tilda-экспорт работает как статика, сервер не нужен)
2. Если нужно проверить интеграцию (API-запросы, формы) — залить на временный `test-<дата>.html` и проверить
3. После деплоя на main — удалить тестовый файл
