# eddytester-landing

Лендинг продукта **API Практикум** (https://eddytester.com/api-practicum).

Сайт на продажу курса по API. Исходник — экспорт из Tilda Zero Block.

---

## Быстрый старт для ИИ-агента

### Репозиторий

```bash
git clone https://github.com/overgoer/eddytester.git
cd eddytester-landing
```

Ветки:
- `main` — то, что на сервере. Всегда синхронизировано с продакшеном.
- `fix/*`, `feat/*` — рабочие ветки. После мержа — удалять.

### Сервер

- **Хостинг:** Timeweb
- **IP:** 85.193.81.51
- **SSH порт:** 2222
- **Пользователь:** root
- **Подключение:** `ssh timeweb` (алиас в ~/.ssh/config)
- **ОС:** Ubuntu 22.04
- **Веб-сервер:** Apache 2.4.52
- **Директория сайта:** `/var/www/eddytester.com/`
- **Владелец файлов:** `stud1:stud1`

### Сайт

- **Домен:** eddytester.com (и www.eddytester.com)
- **Страница практикума:** https://eddytester.com/api-practicum
- **Маршрутизация:** Apache RewriteRule `/api-practicum` → `page101918416.html`
- **Другие страницы:** `page64392263.html` (главная), `page65082509.html` (оферта), и т.д.
- **Прокси:** `/check-key` → localhost:3456, `/bugs` → localhost:3000

---

## Что есть на сервере (кроме лендинга)

| Проект | Путь | Описание |
|---|---|---|
| API Практикум лендинг | `/var/www/eddytester.com/` | Этот проект |
| v0-test-api | `/var/www/v0-test-api/` | Учебное API с 30+ багами |
| ai.iterka.ru | `/var/www/ai.iterka.ru/` | Другой проект |
| free-trial-api | порт 3001 | Микросервис генерации 24ч ключей |
| Telegram бот | — | @api_praktikum_bot |
| Xray (остановлен) | — | Прокси, стоял на 443 порту, отключён |
| MTG (MTProto) | порт 9443 | Telegram MTProto proxy |

---

## Деплой

### Правило: любые изменения — только через Git

Никакого SCP напрямую на `page101918416.html`. Только через Git + ветки.

**Полный workflow** — в [CLAUDE.md](CLAUDE.md).

### Команды деплоя

```bash
# Подключиться
ssh timeweb

# Залить файл (только с main после мержа)
scp -P 2222 page101918416.html root@85.193.81.51:/var/www/eddytester.com/

# Удалить тестовую страницу
ssh timeweb "rm /var/www/eddytester.com/test-*.html"

# Проверить Apache
ssh timeweb "apache2ctl status"
```

Если `ssh timeweb` не сработал, резервная команда:
```bash
ssh -p 2222 root@85.193.81.51
```

---

## HTTPS / SSL

### Текущий статус

- **Сертификат:** Let's Encrypt (certbot 5.6.0)
- **Выпущен:** 2026-05-28
- **Истекает:** 2026-08-26
- **Автообновление:** certbot.timer (systemd, срабатывает 2 раза в сутки)
- **Редирект HTTP→HTTPS:** да, 301

### Конфиги Apache

- **HTTP (порт 80):** `/etc/apache2/sites-available/eddytester.com.conf`
- **HTTPS (порт 443):** `/etc/apache2/sites-available/eddytester.com-le-ssl.conf`
- **Файлы сертификатов:** `/etc/letsencrypt/live/eddytester.com/`

### Уведомления о продлении

Скрипты на сервере:
- `/usr/local/bin/cert-notify.sh` — вызывается certbot после успешного обновления (renew-hook)
- `/usr/local/bin/cert-check.sh` — проверка раз в неделю через cron (понед, 10:00)
- Лог: `/var/log/letsencrypt/renew.log`

Скрипты шлют email на root через sendmail. Если нужны Telegram-уведомления — добавить бот-токен в скрипты.

### Перевыпуск вручную

```bash
ssh timeweb
certbot renew --dry-run              # тест
certbot renew                         # принудительно обновить
```

### Что было на 443 порту раньше

До 2026-05-28 порт 443 был занят Xray (VLESS REALITY, xhttp). Для HTTPS сайта xray был остановлен и отключён:

```bash
systemctl stop xray
systemctl disable xray
```

Если нужно запустить xray обратно на другом порту (например, 8443):
1. Поменять `port` в `/usr/local/etc/xray/config.json`
2. Обновить клиентские конфиги
3. `systemctl enable --now xray`

---

## Git-правила

### Коммиты

Каждый коммит должен содержать:
1. **Цель:** что и зачем менялось
2. **Файлы:** какие файлы затронуты
3. **Результат:** что стало работать иначе

Формат:
```
fix: краткое описание (до 70 символов)

- Цель: ...
- Файлы: file1.html, file2.sh
- Результат: ...
```

Типы коммитов:
- `fix:` — исправление
- `feat:` — новая функциональность
- `docs:` — документация
- `chore:` — служебные изменения

### Ветки

- Ветки именовать: `fix/что-делаем` или `feat/что-делаем`
- После мержа в main — ветку удалять
- Перед мержем — бэкап main тегом `backup/YYYY-MM-DD`

### Тестирование

Перед деплоем на сервер:
1. Открыть `page101918416.html` локально в браузере (Tilda-экспорт = статика, сервер не нужен)
2. Если нужна проверка интеграции (прокси, формы) — залить на `test-$(date +%s).html` на сервере
3. После деплоя — удалить тестовый файл

---

## Архитектура Tilda-экспорта

Файл `page101918416.html` — это экспорт из Tilda Zero Block. Содержит:

- **Обычные блоки** (t050, t142, t225, t847, t858) — HTML-разметка в `<div>`, легко редактировать вручную
- **Zero Block** (t396) — позиционирование в JS (`t396_init`), текст в `tn-atom`, редактировать сложнее

CSS, JS и картинки — в папках `css/`, `js/`, `images/`. Подключаются из HTML.

### Zero Block (t396) — как править

Zero Block хранит позиции элементов в JavaScript. Текст внутри `tn-atom` в long-line HTML. При редактировании:
- Менять только текст/стили внутри `tn-atom`, не трогать JS-координаты
- Не менять структуру t396_init вызова

---

## Prodamus (оплата)

- Домен: `eddytester.payform.ru`
- Виджет ещё не встроен в лендинг
- Скрипты в `head`: `window.prodamusDomain`, `prodamusCurrency`, `successPaymentAddress`, `errorPaymentAddress`

---

## О бэклоге

Текущие планы и задачи — в [CLAUDE.md](CLAUDE.md) в секции "Бэклог". README описывает только то, что уже сделано и работает.
