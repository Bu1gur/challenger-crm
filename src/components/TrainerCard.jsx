import React from "react";

const TrainerCard = ({ trainer, groups = [], onShowClients, onShowSchedule, onEdit }) => {
  // Показываем только существующие группы из справочника
  const groupNames = trainer.groups && groups.length
    ? trainer.groups
        .map(gid => groups.find(g => g.value === gid))
        .filter(Boolean)
        .map(g => g.name)
    : [];

  return (
    <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-3 border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600">
          {trainer.name[0]}
        </div>
        <div>
          <div className="font-bold text-lg">{trainer.name}</div>
          <div className="text-sm text-gray-500">{trainer.specialization}</div>
        </div>
      </div>
      <div className="text-sm text-gray-700">
        Группы: {groupNames.length ? groupNames.join(", ") : "нет доступных групп"}
      </div>
      <div className="text-sm text-gray-700">Клиентов: <b>{trainer.clientsCount}</b></div>
      <div className="flex gap-2 mt-2">
        <button
          className="px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
          onClick={onShowClients}
        >
          Клиенты
        </button>
        <button
          className="px-4 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
          onClick={onShowSchedule}
        >
          Расписание
        </button>
        <button
          className="px-4 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
          onClick={onEdit}
        >
          Редактировать
        </button>
      </div>
    </div>
  );
};

export default TrainerCard;
