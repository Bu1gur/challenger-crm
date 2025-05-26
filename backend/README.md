# CRM Backend (FastAPI)

Бэкенд для CRM (клиенты, тренеры, группы) на FastAPI + SQLite.

## Возможности
- REST API для клиентов, тренеров, групп (CRUD)
- Хранение данных в SQLite (по умолчанию)
- Легко расширяется под новые сущности
- Готов к деплою на Render.com или любой сервер

## Быстрый старт (локально)
1. Установите Python 3.9+
2. Установите зависимости:
   ```sh
   pip install -r requirements.txt
   ```
3. Запустите сервер:
   ```sh
   uvicorn main:app --reload
   ```
4. Откройте Swagger UI: http://localhost:8000/docs

## Деплой на Render.com
- Просто залейте этот проект на GitHub и создайте новый Web Service на Render.com (Python, Gunicorn, команду запуска см. ниже).
- Render автоматически установит зависимости из requirements.txt.
- Для SQLite ничего дополнительно не нужно.

## Команда запуска для Render.com
```
gunicorn -k uvicorn.workers.UvicornWorker main:app
```

---

## Структура
- `main.py` — основной файл FastAPI
- `models.py` — Pydantic-модели и SQLAlchemy ORM
- `database.py` — подключение к базе
- `requirements.txt` — зависимости

---

## Как расширять
- Добавляйте новые модели в `models.py`
- Добавляйте новые эндпоинты в `main.py`
- Для PostgreSQL — поменяйте строку подключения в `database.py`

---

## Контакты
Вопросы — пишите в issues или напрямую разработчику.
