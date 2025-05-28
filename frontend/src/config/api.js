// Централизованная конфигурация API endpoints
const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:8000");

export const API_ENDPOINTS = {
  CLIENTS: `${BASE_URL}/clients`,
  TRAINERS: `${BASE_URL}/trainers`, 
  GROUPS: `${BASE_URL}/groups`,
  PERIODS: `${BASE_URL}/periods`,
  PAYMENTS: `${BASE_URL}/payments`,
  FREEZE_SETTINGS: `${BASE_URL}/freezeSettings`
};

export const API_URLS = {
  // Для обратной совместимости
  CLIENTS: API_ENDPOINTS.CLIENTS,
  TRAINERS: API_ENDPOINTS.TRAINERS,
  GROUPS: API_ENDPOINTS.GROUPS
};
