import React, { useState } from "react";

// Модальное окно со списком клиентов тренера
const TrainerClientsModal = ({ trainer, clients = [], onClose, onAssignTrainer, groups = [] }) => {
  // Получаем только существующие группы тренера
  const trainerGroups = (trainer.groups || [])
    .map(gid => groups.find(g => g.value === gid))
    .filter(Boolean);

  // Если у тренера несколько групп — фильтр по группе
  const [selectedGroup, setSelectedGroup] = useState(
    trainerGroups.length > 0 ? trainerGroups[0].value : ""
  );

  // Фильтруем клиентов по выбранной группе тренера
  const filteredClients = clients.filter(
    c => c.group === selectedGroup
  );

  const hasClients = filteredClients && filteredClients.length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm px-2">
      <div className="bg-white rounded-3xl shadow-2xl p-0 w-full max-w-lg relative animate-fade-in overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 text-gray-900 border-b border-gray-100">
          <h3 className="text-lg font-extrabold">Клиенты тренера: {trainer.name}</h3>
          <button
            className="text-gray-400 text-2xl font-bold hover:text-blue-400 transition"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-6">
          {trainerGroups.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Группа:</label>
              <select
                className="border border-gray-200 rounded-xl px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition bg-gray-50 text-gray-800 font-medium"
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
              >
                {trainerGroups.map(g => (
                  <option key={g.value} value={g.value}>{g.name}</option>
                ))}
              </select>
            </div>
          )}
          {hasClients ? (
            <ul className="space-y-3">
              {filteredClients.map((c) => (
                <li key={c.id} className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="font-semibold">{c.name} {c.surname}</span>
                    <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">{c.phone}</span>
                    <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">{c.status}</span>
                  </div>
                  <div className="text-xs text-gray-400 ml-1">Абонемент: {c.subscription || c.subscriptionPeriod}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 text-sm text-center py-8">Нет клиентов в этой группе</div>
          )}
          {onAssignTrainer && (
            <div className="mt-8 border-t pt-4">
              <button
                className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition font-semibold"
                onClick={() => onAssignTrainer(trainer)}
              >
                Назначить клиента этому тренеру
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerClientsModal;
