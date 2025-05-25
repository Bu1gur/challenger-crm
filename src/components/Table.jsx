import React, { useEffect } from "react";
import { isPaid } from "../utils";

// Таблица клиентов
const Table = ({ clients, onEdit, onDelete, periods, groups, onExtend }) => {
  // Прокидываем periods в window для расчёта в таблице (временно, для совместимости)
  useEffect(() => {
    window.periods = periods;
  }, [periods]);

  return (
    <div className="overflow-x-auto rounded-3xl shadow-2xl bg-white border border-gray-100 text-xs sm:text-sm animate-fade-in">
      <table className="min-w-full table-auto">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 uppercase tracking-wider">
            <th className="p-4 text-left whitespace-nowrap">Фамилия и имя</th>
            <th className="p-4 text-left whitespace-nowrap">Статус</th>
            <th className="p-4 text-left whitespace-nowrap">Оплата</th>
            <th className="p-4 text-left whitespace-nowrap">Осталось тренировок</th>
            <th className="p-4 text-left whitespace-nowrap">Заморозка</th>
            <th className="p-4 text-left whitespace-nowrap">Посещений</th>
            <th className="p-4 text-left whitespace-nowrap">Скидка</th>
            <th className="p-4 text-left whitespace-nowrap">Осталось оплатить</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 && (
            <tr>
              <td colSpan={9} className="p-12 text-center text-gray-400 bg-gray-50 rounded-b-3xl">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-6xl mb-3">🗂️</span>
                  <div className="text-lg font-semibold mb-1">Нет клиентов</div>
                  <div className="text-sm">Добавьте первого клиента, чтобы начать работу</div>
                </div>
              </td>
            </tr>
          )}
          {clients.map((c) => {
            // Поиск срока и группы по value
            const period = periods.find(p => p.value === c.subscriptionPeriod);
            const group = groups.find(g => g.value === c.group);
            const standardSum = period ? period.price : 0;
            const paid = Number(c.paymentAmount || 0);
            const debt = standardSum > 0 ? standardSum - paid : 0;
            return (
              <tr key={c.id} className={`border-b last:border-b-0 hover:bg-blue-50/40 transition ${c.status === "Заморожен" ? "bg-blue-50/60" : ""}`}
                onClick={() => onEdit(c.id)}
                style={{ cursor: 'pointer' }}
              >
                <td className="p-3 font-medium text-gray-900 whitespace-nowrap">{c.surname} {c.name}</td>
                <td className="p-3">
                  <span className={
                    c.status === "Активен"
                      ? "inline-block px-2 py-1 rounded bg-green-50 text-green-700 text-xs"
                      : c.status === "Заморожен"
                      ? "inline-block px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs"
                      : "inline-block px-2 py-1 rounded bg-gray-100 text-gray-500 text-xs"
                  }>
                    {c.status}
                  </span>
                </td>
                <td className="p-3">
                  {isPaid(c, periods) ? (
                    <span className="inline-block px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">Оплачено</span>
                  ) : (
                    <span className="inline-block px-2 py-1 rounded bg-red-50 text-red-600 text-xs">Нет</span>
                  )}
                </td>
                <td className="p-3 text-center font-semibold whitespace-nowrap">
                  {period && typeof period.trainings === 'number' && Array.isArray(c.visits)
                    ? period.trainings - c.visits.length
                    : (typeof c.totalSessions === 'number' && Array.isArray(c.visits)
                        ? c.totalSessions - c.visits.length
                        : <span className="text-gray-400">—</span>)}
                </td>
                <td className="p-3 text-center">
                  {c.status === "Заморожен" && c.freeze ? (
                    <span
                      title={`с ${c.freeze.start} по ${c.freeze.end}${c.freeze.reason ? ", причина: " + c.freeze.reason : ""}${c.freeze.confirmed ? ", подтверждено" : ""}${c.freeze.comment ? ", комментарий: " + c.freeze.comment : ""}`}
                      className="inline-flex flex-col items-start gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs min-w-[120px] text-left border border-blue-100"
                    >
                      <span className="flex items-center gap-1">
                        <span role="img" aria-label="freeze">❄️</span>
                        {c.freeze.start} - {c.freeze.end}
                      </span>
                      {c.freeze.reason && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 rounded px-1 py-0.5 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4-4-4-4m8 8V7" /></svg>
                          {c.freeze.reason}
                        </span>
                      )}
                      {typeof c.freeze.confirmed !== 'undefined' && (
                        <span className={`inline-flex items-center gap-1 ${c.freeze.confirmed ? 'text-green-600' : 'text-gray-400'}`}> 
                          {c.freeze.confirmed ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          )}
                          {c.freeze.confirmed ? 'Подтверждено' : 'Не подтверждено'}
                        </span>
                      )}
                      {c.freeze.comment && (
                        <span className="block text-xs text-blue-500 mt-0.5 truncate max-w-[140px]" title={c.freeze.comment}>
                          💬 {c.freeze.comment}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="p-3 text-center font-semibold whitespace-nowrap">
                  {Array.isArray(c.visits) ? c.visits.length : 0}
                </td>
                <td className="p-3 text-center">
                  {c.hasDiscount ? (
                    <span className="inline-block px-2 py-1 rounded bg-yellow-50 text-yellow-700 text-xs">Скидка</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="p-3 text-center font-semibold whitespace-nowrap">
                  {c.hasDiscount ? (
                    <span className="text-gray-400">—</span>
                  ) : debt > 0 ? (
                    <span className="text-red-600">{debt} сом</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="p-4 text-right flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={e => e.stopPropagation()}>
                  <button
                    title="Продлить"
                    className="bg-gradient-to-r from-green-100 to-green-300 hover:from-green-200 hover:to-green-400 text-green-800 p-2 rounded-xl shadow font-semibold transition"
                    onClick={() => onExtend && onExtend(c.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                  <button
                    title="Редактировать"
                    className="bg-gradient-to-r from-yellow-100 to-yellow-300 hover:from-yellow-200 hover:to-yellow-400 text-yellow-800 p-2 rounded-xl shadow font-semibold transition"
                    onClick={() => onEdit && onEdit(c.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" /></svg>
                  </button>
                  <button
                    title="Удалить"
                    className="bg-gradient-to-r from-red-100 to-red-300 hover:from-red-200 hover:to-red-400 text-red-700 p-2 rounded-xl shadow font-semibold transition"
                    onClick={() => onDelete && onDelete(c.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
