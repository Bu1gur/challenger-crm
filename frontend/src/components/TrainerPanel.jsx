import React, { useState, useEffect } from "react";
import TrainerCard from "./TrainerCard";
import TrainerClientsModal from "./TrainerClientsModal";
import TrainerScheduleModal from "./TrainerScheduleModal";
import TrainerModal from "./TrainerModal";
import { API_ENDPOINTS } from "../config/api";

const TrainerPanel = ({ clients = [], setClients, groups = [], onAssignTrainer }) => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [showClients, setShowClients] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [editTrainer, setEditTrainer] = useState(null);

  useEffect(() => {
    fetch(API_ENDPOINTS.TRAINERS)
      .then((res) => res.json())
      .then(setTrainers)
      .catch(() => setTrainers([]));
  }, []);

  const handleSaveTrainer = (trainer) => {
    if (trainer.id) {
      fetch(`${API_ENDPOINTS.TRAINERS}/${trainer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trainer),
      })
        .then((res) => res.json())
        .then((updated) =>
          setTrainers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
        );
    } else {
      fetch(API_ENDPOINTS.TRAINERS, {
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

  const handleDeleteTrainer = (trainer) => {
    if (window.confirm("Удалить этого тренера?")) {
      fetch(`${API_ENDPOINTS.TRAINERS}/${trainer.id}`, { method: "DELETE" })
        .then(() => setTrainers((prev) => prev.filter((t) => t.id !== trainer.id)));
      setShowTrainerModal(false);
      setEditTrainer(null);
    }
  };

  const getTrainerClients = (trainer) => {
    if (!trainer) return [];
    return (clients || []).filter(
      (c) => Array.isArray(trainer.groups) && trainer.groups.includes(c.group)
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Тренеры
        </h2>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          onClick={() => {
            setEditTrainer(null);
            setShowTrainerModal(true);
          }}
        >
          Добавить тренера
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      {trainers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🧑‍🏫</div>
          <div className="text-lg font-medium mb-2">Нет тренеров</div>
          <div className="text-sm">Добавьте первого тренера, чтобы начать работу</div>
        </div>
      )}
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
