import React from "react";

const TrainerCard = ({ trainer, groups = [], onShowClients, onShowSchedule, onEdit }) => {
  const groupNames = trainer.groups && groups.length
    ? trainer.groups
        .map(gid => groups.find(g => g.value === gid))
        .filter(Boolean)
        .map(g => g.name)
    : [];

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-7 flex flex-col gap-4 border border-gray-100 hover:shadow-3xl transition-all duration-200 animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-black text-blue-600 shadow-inner">
          {trainer.name[0]}
        </div>
        <div>
          <div className="font-extrabold text-xl text-gray-900 mb-1">{trainer.name}</div>
          <div className="text-sm text-gray-500 font-medium">{trainer.specialization}</div>
        </div>
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-semibold">Группы:</span> {groupNames.length ? groupNames.join(", ") : <span className="text-gray-400">нет</span>}
      </div>
      <div className="text-sm text-gray-700">
        <span className="font-semibold">Клиентов:</span> <b>{trainer.clientsCount}</b>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-800 rounded-xl shadow font-semibold transition-all duration-200 text-sm"
          onClick={onShowClients}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M9 7a4 4 0 108 0 4 4 0 00-8 0z" /></svg>
          Клиенты
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 rounded-xl shadow font-semibold transition-all duration-200 text-sm"
          onClick={onShowSchedule}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M16 3v5M8 3v5" /></svg>
          Расписание
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300 text-yellow-800 rounded-xl shadow font-semibold transition-all duration-200 text-sm"
          onClick={onEdit}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" /></svg>
          Редактировать
        </button>
      </div>
    </div>
  );
};

export default TrainerCard;
