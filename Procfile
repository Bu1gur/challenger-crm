web: npm install --prefix frontend && npm run build --prefix frontend && mkdir -p backend/static && cp -r frontend/dist/* backend/static/ && uvicorn backend.main:app --host 0.0.0.0 --port $PORT
