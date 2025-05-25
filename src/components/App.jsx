import React, { useState } from "react";
import ClientPanel from "./components/ClientPanel";
import TrainerPanel from "./components/TrainerPanel";

const initialGroups = [
  { value: "g1", name: "Группа А" },
  { value: "g2", name: "Группа Б" },
  { value: "g3", name: "Группа C" },
  { value: "g4", name: "Группа D" },
];

const App = () => {
  const [clients, setClients] = useState([]);
  const [groups, setGroups] = useState(initialGroups);
  // ...можно добавить аналогично setTrainers если потребуется...

  // Назначить тренера клиенту (пример: открывается TrainerClientsModal и выбирается клиент)
  const handleAssignTrainer = (trainer) => {
    // Здесь можно реализовать выбор клиента для назначения
    // Например, через prompt или отдельное модальное окно
    const clientName = window.prompt("Введите имя клиента для назначения тренеру " + trainer.name);
    if (!clientName) return;
    setClients((prev) =>
      prev.map((c) =>
        c.name === clientName ? { ...c, trainer: trainer.name } : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">CRM Challenger</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ClientPanel clients={clients} setClients={setClients} groups={groups} />
          </div>
          <div>
            <TrainerPanel clients={clients} onAssignTrainer={handleAssignTrainer} groups={groups} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
