#!/bin/bash

echo "🧪 Тестирование Production API для создания клиента..."
echo "URL: https://challenger-crm.onrender.com/clients"
echo ""

# Тестовые данные клиента (только поля, поддерживаемые API)
TEST_CLIENT='{
  "contract_number": "TEST-001",
  "name": "Тестовый",
  "surname": "Клиент", 
  "phone": "+996555123456",
  "address": "Тестовый адрес",
  "birth_date": "1990-01-01",
  "start_date": "2025-06-24",
  "end_date": "2025-07-24",
  "subscription_period": "1m",
  "payment_amount": "2000",
  "payment_method": "cash",
  "group": "group1",
  "comment": "Тестовый клиент для проверки API",
  "status": "Активен",
  "paid": true,
  "total_sessions": 0,
  "has_discount": false,
  "discount_reason": "",
  "trainer": "Тестовый тренер"
}'

echo "📤 Отправляем POST запрос..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_CLIENT" \
  https://challenger-crm.onrender.com/clients)

HTTP_CODE=$(echo "$RESPONSE" | tail -1 | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📥 Ответ сервера:"
echo "HTTP код: $HTTP_CODE"
echo "Тело ответа: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ SUCCESS: Клиент успешно создан!"
    echo "🎉 HTTP 422 ошибка исправлена в продакшене!"
elif [ "$HTTP_CODE" = "422" ]; then
    echo "❌ FAILED: HTTP 422 ошибка все еще присутствует"
    echo "🔍 Проверьте, что новый деплой завершился"
else
    echo "⚠️  WARNING: Неожиданный HTTP код: $HTTP_CODE"
fi

echo ""
echo "🌐 Проверьте также браузерную консоль на: https://challenger-crm.onrender.com"
