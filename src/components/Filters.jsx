import React from "react";

// Фильтры: поиск, тренер, статус
const Filters = ({ filter, setFilter, clients }) => {
  // Получить уникальные имена тренеров и статусы
  const trainers = Array.from(new Set(clients.map((c) => c.trainer)));
  const statuses = Array.from(new Set(clients.map((c) => c.status)));

  return (
    <div className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <input
        className="border border-gray-200 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition w-64 text-gray-800 bg-gray-50 placeholder-gray-400 font-medium"
        placeholder="Поиск по имени или телефону"
        value={filter.search}
        onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
      />
      <select
        className="border border-gray-200 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition bg-gray-50 text-gray-800 font-medium"
        value={filter.trainer}
        onChange={(e) => setFilter((f) => ({ ...f, trainer: e.target.value }))}
      >
        <option value="">Все тренеры</option>
        {trainers.map((t, idx) => (
          <option key={t || idx} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        className="border border-gray-200 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition bg-gray-50 text-gray-800 font-medium"
        value={filter.status}
        onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
      >
        <option value="">Все статусы</option>
        {statuses.map((s, idx) => (
          <option key={s || idx} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Filters;
