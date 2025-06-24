import React from "react";

const TrainerCard = ({ trainer, groups = [], onShowClients, onShowSchedule, onEdit }) => {
  const groupNames = trainer.groups && groups.length
    ? trainer.groups
        .map(gid => groups.find(g => g.value === gid))
        .filter(Boolean)
        .map(g => g.name)
    : [];

  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg font-semibold text-blue-600">
          {trainer.name[0]}
        </div>
        <div>
          <div className="font-semibold text-lg text-gray-900">{trainer.name}</div>
          <div className="text-sm text-gray-600">{trainer.specialization}</div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="text-sm text-gray-700">
          <span className="font-medium">Группы:</span> {groupNames.length ? groupNames.join(", ") : <span className="text-gray-400">нет</span>}
        </div>
        <div className="text-sm text-gray-700">
          <span className="font-medium">Клиентов:</span> <span className="font-semibold">{trainer.clientsCount}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium transition-colors"
          onClick={onShowClients}
        >
          Клиенты
        </button>
        <button
          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded text-sm font-medium transition-colors"
          onClick={onShowSchedule}
        >
          Расписание
        </button>
        <button
          className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium transition-colors"
          onClick={onEdit}
        >
          Редактировать
        </button>
      </div>
    </div>
  );
};

export default TrainerCard;
