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
    <div className="max-w-[98vw] 2xl:max-w-[1600px] mx-auto bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-3xl shadow-3xl p-4 sm:p-12 mt-2 sm:mt-10 border border-gray-100 animate-fade-in min-h-[80vh]">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-6">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-2 sm:mb-0 drop-shadow-lg">
          Тренеры
        </h2>
        <button
          className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white px-7 py-3 rounded-2xl shadow-xl font-bold text-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={() => {
            setEditTrainer(null);
            setShowTrainerModal(true);
          }}
        >
          + Добавить тренера
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 animate-fade-in">
          <span className="text-7xl mb-6">🧑‍🏫</span>
          <div className="text-2xl font-bold mb-2">Нет тренеров</div>
          <div className="text-base">Добавьте первого тренера, чтобы начать работу</div>
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
