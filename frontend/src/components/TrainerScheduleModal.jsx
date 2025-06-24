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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Расписание тренера: {trainer.name}</h3>
          <button
            className="text-gray-400 hover:text-gray-600 text-xl"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {schedule.length > 0 ? (
            <ul className="space-y-3">
              {schedule.map((item, i) => (
                <li key={i} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium">{item.group}</span>
                    {item.days.length > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        {item.days.join(", ")}
                      </span>
                    )}
                    {item.time && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {item.time}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-center py-8">Нет групп</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerScheduleModal;
