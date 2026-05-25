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

## Редактирование

```bash
# Скачать с сервера в локальный репозиторий
ssh -p 2222 root@85.193.81.51 "cat /var/www/eddytester.com/page101918416.html" > page101918416.html

# Отредактировать локально
# ...edit...

# Залить на сервер
scp -P 2222 page101918416.html root@85.193.81.51:/var/www/eddytester.com/
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
