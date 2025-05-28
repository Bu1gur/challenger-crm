# Challenger CRM v0.9.0 Beta

Система управления клиентами боксерского клуба с функциями управления абонементами, тренировками и клиентской базой.

## Технологии

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Lucide React (иконки)
- XLSX.js (экспорт в Excel)
- FileSaver.js

**Backend:**
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Python-dotenv
- Uvicorn

## Быстрый старт

### Разработка (локально)

1. **Backend:**
```bash
cd backend
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на `http://localhost:5173/challenger-crm/`
API документация: `http://localhost:8000/docs`

### Production build

```bash
./build.sh
```

Это создаст production сборку и скопирует файлы в `backend/static/`

## Развертывание

### Render.com (полнофункциональное приложение)

1. Создайте новый Web Service на render.com
2. Подключите GitHub репозиторий
3. Используйте настройки из `render.yaml`:
   - Build Command: `./build.sh`
   - Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Environment: Python 3.12

Переменные окружения:
- `DATABASE_URL`: `sqlite:///./crm.db`
- `CORS_ORIGINS`: `https://your-app.onrender.com`

### GitHub Pages (frontend-only)

1. В настройках репозитория включите GitHub Pages
2. Выберите source: "GitHub Actions"
3. Workflow в `.github/workflows/deploy.yml` автоматически развернет frontend

⚠️ **Важно:** GitHub Pages версия работает только с mock данными, так как не может подключиться к backend.

## Структура проекта

```
challenger-crm/
├── backend/                 # FastAPI backend
│   ├── main.py             # Основное API приложение
│   ├── models.py           # SQLAlchemy модели
│   ├── database.py         # Конфигурация БД
│   ├── crm.db              # SQLite база данных
│   ├── requirements.txt    # Python зависимости
│   ├── .env               # Переменные окружения
│   └── static/            # Production frontend files
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── config/        # Конфигурация API
│   │   ├── data/          # Mock данные
│   │   └── utils/         # Утилиты
│   ├── package.json
│   └── vite.config.js
├── build.sh               # Скрипт сборки
├── render.yaml           # Конфигурация Render.com
└── .github/workflows/    # GitHub Actions
```

## API Endpoints

### Клиенты
- `GET /clients` - Список клиентов
- `POST /clients` - Создать клиента
- `PUT /clients/{id}` - Обновить клиента
- `DELETE /clients/{id}` - Удалить клиента

### Тренеры
- `GET /trainers` - Список тренеров
- `POST /trainers` - Создать тренера
- `PUT /trainers/{id}` - Обновить тренера
- `DELETE /trainers/{id}` - Удалить тренера

### Справочники
- `GET /periods` - Периоды абонемента
- `POST /periods` - Создать период
- `PUT /periods/{id}` - Обновить период
- `DELETE /periods/{id}` - Удалить период

- `GET /groups` - Группы тренировок
- `POST /groups` - Создать группу
- `PUT /groups/{id}` - Обновить группу
- `DELETE /groups/{id}` - Удалить группу

- `GET /payments` - Способы оплаты
- `POST /payments` - Создать способ оплаты
- `PUT /payments/{id}` - Обновить способ оплаты
- `DELETE /payments/{id}` - Удалить способ оплаты

- `GET /freezeSettings` - Настройки заморозки
- `PUT /freezeSettings/1` - Обновить настройки заморозки

## Функции

### Управление клиентами
- ✅ Добавление/редактирование/удаление клиентов
- ✅ Поиск и фильтрация клиентов
- ✅ Экспорт клиентской базы в Excel
- ✅ Управление статусами абонементов
- ✅ Система скидок и комментариев

### Управление тренерами  
- ✅ Добавление/редактирование тренеров
- ✅ Привязка клиентов к тренерам
- ✅ Расписание тренеров

### Справочники
- ✅ Периоды абонемента (1мес, 3мес, 6мес, 12мес)
- ✅ Группы тренировок с расписанием
- ✅ Способы оплаты (наличные, карта, переводы)
- ✅ Настройки заморозки абонементов

### Административная панель
- ✅ Управление всеми справочниками
- ✅ Настройка условий заморозки
- ✅ Валидация данных
- ✅ Async API интеграция

## Безопасность

- CORS настроен для разрешенных доменов
- Валидация данных через Pydantic
- Безопасные SQL запросы через SQLAlchemy ORM
- Переменные окружения для конфигурации

## Разработка

### Добавление новых функций

1. **Backend:** Добавьте модель в `models.py`, эндпоинт в `main.py`
2. **Frontend:** Создайте компонент в `src/components/`
3. **API:** Обновите `src/config/api.js` с новыми endpoints

### Отладка

- Backend логи: uvicorn автоматически выводит запросы
- Frontend: используйте DevTools браузера
- База данных: подключитесь к SQLite через любой SQL клиент

## Статус проекта

✅ **Завершено:**
- Backend API с полным CRUD
- Frontend с административной панелью
- Интеграция frontend-backend
- Система справочников
- Конфигурация для развертывания
- База данных с образцами данных

🔧 **В разработке:**
- Аутентификация и авторизация
- Уведомления и напоминания
- Расширенная аналитика
- Мобильная версия

## Поддержка

Для вопросов и предложений создавайте Issues в GitHub репозитории.

---

© 2025 Challenger CRM - Система управления боксерским клубом
