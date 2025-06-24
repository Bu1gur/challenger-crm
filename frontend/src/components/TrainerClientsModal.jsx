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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Клиенты тренера: {trainer.name}</h3>
          <button
            className="text-gray-400 hover:text-gray-600 text-xl"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {trainerGroups.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Группа:</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <li key={c.id} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{c.name} {c.surname}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{c.phone}</span>
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">{c.status}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Абонемент: {c.subscription || c.subscriptionPeriod}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-center py-8">Нет клиентов в этой группе</div>
          )}
          {onAssignTrainer && (
            <div className="mt-6 pt-4 border-t">
              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
