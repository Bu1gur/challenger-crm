import React from "react";

// Модальное окно с расписанием тренера
const TrainerScheduleModal = ({ trainer, onClose, groups = [] }) => {
  // Показываем только существующие группы из справочника
  const trainerGroups = (trainer.groups || [])
    .map(gid => groups.find(g => g.value === gid))
    .filter(Boolean);

  // Для каждой группы показываем реальные дни и время
  const schedule = trainerGroups.map((group) => ({
    group: group.name,
    days: group.days && group.days.length ? group.days : [],
    time: group.timeStart && group.timeEnd ? `${group.timeStart}–${group.timeEnd}` : "",
  }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm px-2">
      <div className="bg-white rounded-3xl shadow-2xl p-0 w-full max-w-lg relative animate-fade-in overflow-hidden border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 text-gray-900 border-b border-gray-100">
          <h3 className="text-lg font-extrabold">Расписание тренера: {trainer.name}</h3>
          <button
            className="text-gray-400 text-2xl font-bold hover:text-green-400 transition"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-6">
          {schedule.length > 0 ? (
            <ul className="space-y-3">
              {schedule.map((item, i) => (
                <li key={i} className="flex flex-col gap-1 p-3 rounded-xl bg-green-50 border border-green-100 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="font-semibold">{item.group}</span>
                    {item.days.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">
                        {item.days.join(", ")}
                      </span>
                    )}
                    {item.time && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                        {item.time}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 text-sm text-center py-8">Нет групп</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerScheduleModal;
