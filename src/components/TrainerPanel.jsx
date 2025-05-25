import React, { useState } from "react";
import TrainerCard from "./TrainerCard";
import TrainerClientsModal from "./TrainerClientsModal";
import TrainerScheduleModal from "./TrainerScheduleModal";
import TrainerModal from "./TrainerModal";

// Заготовка панели тренеров
const TrainerPanel = ({ clients = [], setClients, groups = [], onAssignTrainer }) => {
  const [trainers, setTrainers] = useState(() => {
    const saved = localStorage.getItem("trainers");
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) return arr;
      } catch {}
    }
    return [
      {
        id: 1,
        name: "Иван Иванов",
        phone: "+996700000001",
        specialization: "Фитнес",
        groups: ["Группа А", "Группа Б"],
        comment: "",
      },
      {
        id: 2,
        name: "Мария Петрова",
        phone: "+996700000002",
        specialization: "Йога",
        groups: ["Группа C"],
        comment: "",
      },
    ];
  });
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showClients, setShowClients] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);

  // Сохраняем тренеров в localStorage
  React.useEffect(() => {
    localStorage.setItem("trainers", JSON.stringify(trainers));
  }, [trainers]);

  // Добавление/редактирование тренера
  const handleSaveTrainer = (trainer) => {
    if (trainer.id) {
      setTrainers((prev) =>
        prev.map((t) => (t.id === trainer.id ? { ...t, ...trainer, groups: trainer.groups || [] } : t))
      );
    } else {
      setTrainers((prev) => [
        ...prev,
        { ...trainer, id: Date.now(), groups: trainer.groups || [] }, // сохраняем выбранные группы
      ]);
    }
    setShowTrainerModal(false);
    setEditTrainer(null);
  };

  // Удаление тренера
  const handleDeleteTrainer = (trainer) => {
    if (window.confirm("Удалить этого тренера?")) {
      setTrainers((prev) => prev.filter((t) => t.id !== trainer.id));
      setShowTrainerModal(false);
      setEditTrainer(null);
    }
  };

  // Получить клиентов тренера по группам
  const getTrainerClients = (trainer) => {
    if (!trainer) return [];
    // Собираем клиентов, у которых группа входит в trainer.groups
    return (clients || []).filter(
      (c) =>
        Array.isArray(trainer.groups) && trainer.groups.includes(c.group)
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Тренеры</h2>
        <button
          className="px-6 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg shadow font-semibold transition-all duration-200"
          onClick={() => {
            setEditTrainer(null);
            setShowTrainerModal(true);
          }}
        >
          Добавить тренера
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trainers.map((trainer) => (
          <TrainerCard
            key={trainer.id}
            trainer={{ ...trainer, clientsCount: getTrainerClients(trainer).length }}
            groups={groups} // <--- добавляем groups для отображения имён групп
            onShowClients={() => {
              setSelectedTrainer(trainer);
              setShowClients(true);
            }}
            onShowSchedule={() => {
              setSelectedTrainer(trainer);
              setShowSchedule(true);
            }}
            onEdit={() => {
              setEditTrainer(trainer);
              setShowTrainerModal(true);
            }}
          />
        ))}
      </div>
      {showClients && selectedTrainer && (
        <TrainerClientsModal
          trainer={selectedTrainer}
          clients={getTrainerClients(selectedTrainer)}
          groups={groups} // <-- добавлено
          onClose={() => setShowClients(false)}
          onAssignTrainer={onAssignTrainer}
        />
      )}
      {showSchedule && selectedTrainer && (
        <TrainerScheduleModal
          trainer={selectedTrainer}
          groups={groups} // <-- добавьте эту строку
          onClose={() => setShowSchedule(false)}
        />
      )}
      {showTrainerModal && (
        <TrainerModal
          trainer={editTrainer}
          editMode={!!editTrainer}
          onSave={handleSaveTrainer}
          onDelete={handleDeleteTrainer}
          onClose={() => setShowTrainerModal(false)}
          groups={groups}
        />
      )}
    </div>
  );
};

export default TrainerPanel;
