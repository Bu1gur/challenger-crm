#!/bin/bash

# Принудительный деплой на Render.com
echo "🚀 Forcing production deployment..."

# Создаем пустой коммит для принудительного деплоя
git add .
git commit -m "🔧 FORCE DEPLOY: HTTP 422 production fix v1.0.0

- Completely rewritten ClientModal data submission logic
- Removed all unsupported fields (visits, freeze, freezeHistory) 
- Direct snake_case field mapping in ClientModal
- Simplified ClientPanel data handling
- This should FINALLY fix HTTP 422 errors in production!"

git push origin main

echo "✅ Deployment triggered! Check Render.com dashboard for progress."
echo "🔗 https://dashboard.render.com"
echo "🔗 https://challenger-crm.onrender.com"
