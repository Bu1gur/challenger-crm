import React, { useState, useEffect } from "react";
import TrainerCard from "./TrainerCard";
import TrainerClientsModal from "./TrainerClientsModal";
import TrainerScheduleModal from "./TrainerScheduleModal";
import TrainerModal from "./TrainerModal";

// Новый API URL
const API_URL = "https://challenger-crm.onrender.com/trainers";

const TrainerPanel = ({ clients = [], setClients, groups = [], onAssignTrainer }) => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showClients, setShowClients] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);

  // Получаем тренеров с сервера
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setTrainers)
      .catch(() => setTrainers([]));
  }, []);

  // Добавление/редактирование тренера
  const handleSaveTrainer = (trainer) => {
    if (trainer.id) {
      // Обновление
      fetch(`${API_URL}/${trainer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainer),
      })
        .then((res) => res.json())
        .then((updated) =>
          setTrainers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        );
    } else {
      // Добавление
      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...trainer, groups: trainer.groups || [] }),
      })
        .then((res) => res.json())
        .then((newTrainer) => setTrainers((prev) => [...prev, newTrainer]));
    }
    setShowTrainerModal(false);
    setEditTrainer(null);
  };

  // Удаление тренера
  const handleDeleteTrainer = (trainer) => {
    if (window.confirm("Удалить этого тренера?")) {
      fetch(`${API_URL}/${trainer.id}`, { method: "DELETE" })
        .then(() => setTrainers((prev) => prev.filter((t) => t.id !== trainer.id)));
      setShowTrainerModal(false);
      setEditTrainer(null);
    }
  };

  // Получить клиентов тренера по группам
  const getTrainerClients = (trainer) => {
    if (!trainer) return [];
    return (clients || []).filter(
      (c) => Array.isArray(trainer.groups) && trainer.groups.includes(c.group)
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
            groups={groups}
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
          groups={groups}
          onClose={() => setShowClients(false)}
          onAssignTrainer={onAssignTrainer}
        />
      )}
      {showSchedule && selectedTrainer && (
        <TrainerScheduleModal
          trainer={selectedTrainer}
          groups={groups}
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
