web: cd frontend && npm install && npm run build && cd ../backend && mkdir -p static && cp -r ../frontend/dist/* static/ && cd .. && uvicorn backend.main:app --host 0.0.0.0 --port $PORT
