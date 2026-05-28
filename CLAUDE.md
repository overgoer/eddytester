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

## Правила коммитов

Каждый коммит должен содержать:
1. **Цель:** что и зачем
2. **Файлы:** какие файлы менялись
3. **Результат:** что стало иначе

Формат:
```
тип: краткое описание (до 70 символов)

- Цель: ...
- Файлы: file1.html, file2.sh
- Результат: ...
```

Типы: `fix:` / `feat:` / `docs:` / `chore:`

Пример:
```
fix: sync repo with deployed state (CTA restyle + free trial button)

- Цель: репозиторий рассинхронизирован с сервером — в нём не было
  последних правок CTA-блока, которые уже работают на сайте
- Файлы: page101918416.html, CLAUDE.md
- Результат: main теперь совпадает с продакшеном, хеш ce20cc2
```

Следовать этому формату обязательно. Агент должен писать осмысленные commit message,
а не "update file" или "fix bug".

## Важные моменты

- **Не удалять** другие `page*.html` — они используются как отдельные страницы
- **CSS/JS/images** лежат в соответствующих папках (ссылаются из Tilda-экспорта)
- **Баги в v1 API — учебные, не чинить** (проект `v0-test-api`)
- **ЮKassa** — платёжная система (shopId: 1367335, ключ в .env на сервере)
- **Prodamus** — удалён с 2026-05-28
- **Платежный бэкенд:** `payment.js` на порту 3457, запущен через PM2

## Связь с продуктом

- **Telegram бот:** https://t.me/api_praktikum_bot (воронка: 4 задачи → прогрев → оффер)
- **Free Trial API:** отдельный микросервис на Timeweb (генерация 24ч ключей)
- **Основное API (v0-test-api):** Express + PostgreSQL, учебный стенд с 30+ багами
- **Цена:** Early Bird 2 900₽ (вместо 4 990₽) — единая с ботом

## Что не трогать

- Другие проекты на сервере (Telegram боты, Free Trial API и т.д.)
- `.env` файлы с реальными ключами

## Бэклог

### 1. SSL (Let's Encrypt) — ✅ СДЕЛАНО

**Статус на 2026-05-28:**
- ✅ Certbot выпустил сертификат на `eddytester.com` + `www.eddytester.com`
- ✅ HTTPS работает на порту 443
- ✅ HTTP → HTTPS редирект (301)
- ✅ Xray (занимал порт 443) — остановлен и отключён
- ✅ Systemd-таймер certbot активен (срабатывает 2 раза в сутки)
- ✅ Renew-hook скрипт `/usr/local/bin/cert-notify.sh`
- ✅ Еженедельный чекер `/usr/local/bin/cert-check.sh` (cron: пн 10:00)
- ✅ Лог обновлений: `/var/log/letsencrypt/renew.log`
- ⬜ **Проверить и починить SSH** (периодически "Connection timed out during banner exchange" на порту 2222)
- ⬜ `certbot renew --dry-run` — запустить когда SSH заработает
- ⬜ Удалить дубли в crontab (`sort -u`)

**Что помнить:**
- Сертификат живёт 90 дней, certbot обновляет сам
- Уведомления пока через sendmail на root. Для Telegram — нужен бот-токен
- Если SSH не работает — через аптайм сервера, Apache не перезагружать

### 2. ЮKassa — платежи — ✅ СДЕЛАНО (ветка feat/yookassa-payments)

**Статус на 2026-05-28:**
- ✅ `payment.js` — Node.js сервер на порту 3457 (PM2, payment-yookassa)
- ✅ `.env` на сервере с shopId + secretKey
- ✅ Apache ProxyPass `/create-payment` → localhost:3457 (в HTTP и SSL конфигах)
- ✅ Бэкенд возвращает confirmation_token от ЮKassa
- ✅ Тестовая страница: `https://eddytester.com/test-yookassa.html`
- ✅ `page101918416.html` — Prodamus удалён, добавлен YooKassa Checkout Widget
- ✅ **Тест пройден** — платёж 10₽ успешно проведён через Tinkoff (карта MIR, без 3-D Secure)
- ✅ CDN виджета: `https://yookassa.ru/checkout-widget/v1/checkout-widget.js` (класс `YooMoneyCheckoutWidget`)
- ✅ Кнопка "Начать учиться" в блоке "Стоимость" открывает попап с оплатой (исправлено: вела в Telegram)
- ✅ В попапе отображается цена 2 900 ₽ в стиле основного сайта
- ✅ Исправлен баг: пропущенная `)` в конструкторе YooMoneyCheckoutWidget
- ✅ Вмержено в main, задеплоено в продакшен
- ⬜ **Создать тестовый магазин** в ЛК ЮKassa (`https://yookassa.ru/my/`) для безопасного тестирования
- ⬜ Настроить рефанды — через Tinkoff gateway не работают, нужна конфигурация в ЛК ЮKassa

**Архитектура:**
- Кнопка "Купить" → POST /create-payment → ЮKassa API → confirmation_token → YooMoneyCheckoutWidget
- После оплаты → редирект на `https://eddytester.com/api`
- Ключи в `/var/www/eddytester.com/.env`
- `test: true` в API **не работает** с production магазином — нужен отдельный тестовый магазин
- Виджет грузится с `yookassa.ru/checkout-widget/v1/checkout-widget.js` (не `static.yoomoney.ru`)

**Уроки:**
- `YooKassaCheckoutWidget` не существует — правильное имя `YooMoneyCheckoutWidget`
- Тестовые карты ЮKassa: `5555555555554444` (Mastercard без 3DS), `4111111111111111` (Visa без 3DS) и др.
- Production магазин игнорирует `test: true` — для тестовых платежей нужен тестовый магазин

### 3. Рефакторинг: один попап ЮKassa для всех кнопок

Сейчас цена 2 900 ₽ зашита в HTML попапа и в JS. Задача:
- Одна функция `openYooKassaPayment(amount, description)`
- Кнопки хранят цену в `data-amount` и `data-description`
- JS читает атрибуты с кнопки, подставляет в попап и в API-запрос
- Одна итерация: перевести pricing-кнопку на новую схему

### 4. Тестовый магазин ЮKassa

Создать тестовый магазин в ЛК ЮKassa (`https://yookassa.ru/my/`), получить shopId + secretKey.
Обновить `payment.js` для поддержки тестовых ключей (переключение по `test: true`).

### 4. Уборка на сервере

- ✅ Удалён `/var/www/eddytester.com/test.html`
- ✅ Удалён `/var/www/eddytester.com/test-yookassa.html`
- ⬜ Удалить `/var/www/eddytester.com/page101918416.html.bak`
- ⬜ Удалить `/var/www/eddytester.com/readme.txt`
- ⬜ Разобраться с `index.html` в корне (содержит старый Prodamus код)

### 5. Инфраструктура

- ⬜ Починить SSH (периодически "Connection timed out during banner exchange" на порту 2222)
- ⬜ `certbot renew --dry-run` — запустить когда SSH заработает
- ⬜ Удалить дубли в crontab (`sort -u`)
- ⬜ PM2: в памяти 6.0.14, локально 7.0.1 — нужен `pm2 update`
- ⬜ Добавить Telegram-уведомления о продлении сертификата

### 6. Тестирование изменений

При изменениях лендинга:
1. Проверять локально — открыть HTML-файл в браузере (Tilda-экспорт работает как статика, сервер не нужен)
2. Если нужно проверить интеграцию (API-запросы, формы) — залить на временный `test-<дата>.html` и проверить
3. После деплоя на main — удалить тестовый файл
