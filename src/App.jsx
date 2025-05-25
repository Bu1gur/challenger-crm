import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ClientPanel from "./components/ClientPanel";
import TrainerPanel from "./components/TrainerPanel";
import AdminPanel from "./components/AdminPanel";

// MVP: современная навигация по разделам
const nav = [
  { key: "clients", label: "Клиенты" },
  { key: "trainers", label: "Тренеры" },
  { key: "admin", label: "Админка" },
];

const defaultPeriods = [
  { label: "1 месяц", value: "1m", months: 1, price: 4000, trainings: 12 },
  { label: "3 месяца", value: "3m", months: 3, price: 12000, trainings: 36 },
  { label: "6 месяцев", value: "6m", months: 6, price: 24000, trainings: 72 },
  { label: "12 месяцев", value: "12m", months: 12, price: 48000, trainings: 144 },
];
const defaultGroups = [
  { name: "Без группы", value: "none", days: [] },
  { name: "Группа 1", value: "g1", days: ["Пн", "Ср", "Пт"] },
  { name: "Группа 2", value: "g2", days: ["Вт", "Чт", "Сб"] },
];
const defaultPayments = [
  { label: "Наличные", value: "Наличные" },
  { label: "Карта", value: "Карта" },
  { label: "Перевод", value: "Перевод", banks: ["Мбанк", "Оптима", "Бакай"] },
];
const defaultFreezeSettings = {
  maxDays: 30,
  reasons: ["Болезнь", "Отпуск", "Учёба"],
  requireConfirm: true,
};

const App = () => {
  const [section, setSection] = React.useState("clients");
  // Справочники
  const [periods, setPeriods] = React.useState(defaultPeriods);
  const [groups, setGroups] = React.useState(defaultGroups);
  const [payments, setPayments] = React.useState(defaultPayments);
  const [freezeSettings, setFreezeSettings] = React.useState(defaultFreezeSettings);
  const [clients, setClients] = React.useState([]); // Добавлено состояние для клиентов

  // Назначить тренера клиенту (пример)
  const handleAssignTrainer = (trainer) => {
    const clientName = window.prompt("Введите имя клиента для назначения тренеру " + trainer.name);
    if (!clientName) return;
    setClients((prev) =>
      prev.map((c) =>
        c.name === clientName ? { ...c, trainer: trainer.name } : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        <Sidebar />
        <main className="flex-1 p-2 sm:p-6">
          <div className="flex items-center gap-4 mb-8 pl-2 sm:pl-8">
            {/* SVG-лого Challenger (ромб, градиент, без текста) */}
            <span className="inline-flex items-center justify-center bg-black rounded-full p-1 shadow-lg">
              <svg
                width="56"
                height="56"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F87171" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                </defs>
                <rect
                  x="8"
                  y="8"
                  width="40"
                  height="40"
                  rx="8"
                  fill="url(#grad1)"
                />
                <polygon
                  points="28,12 44,28 28,44 12,28"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                />
                <polygon
                  points="28,16 40,28 28,40 16,28"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                />
              </svg>
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
                CHANLENGER boxing gym CRM
              </h1>
              <div className="text-xs text-gray-400">
                BoxClub CRM v0.9.0 Beta — 24.05.2025
              </div>
            </div>
          </div>
          <nav className="mb-8 flex gap-4 flex-wrap">
            {nav.map((item) => (
              <button
                key={item.key}
                className={`px-7 py-3 rounded-full font-extrabold tracking-wide text-base shadow-md border-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300/60
                  ${section === item.key
                    ? "bg-gradient-to-r from-blue-400 via-blue-600 to-blue-500 text-white shadow-xl ring-2 ring-blue-200/60 scale-105"
                    : "bg-gradient-to-r from-gray-100 via-white to-gray-50 text-blue-700 hover:from-blue-50 hover:to-blue-100 hover:text-blue-900 hover:shadow-xl"}
                `}
                style={{ minWidth: 140, letterSpacing: '0.04em' }}
                onClick={() => setSection(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          {section === "clients" && (
            <ClientPanel
              periods={periods}
              groups={groups}
              payments={payments}
              freezeSettings={freezeSettings}
              clients={clients}
              setClients={setClients}
            />
          )}
          {section === "trainers" && (
            <TrainerPanel
              clients={clients}
              setClients={setClients}
              groups={groups}
              onAssignTrainer={handleAssignTrainer} // <-- добавлено
            />
          )}
          {section === "admin" && (
            <AdminPanel
              periods={periods}
              setPeriods={setPeriods}
              groups={groups}
              setGroups={setGroups}
              payments={payments}
              setPayments={setPayments}
              freezeSettings={freezeSettings}
              setFreezeSettings={setFreezeSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
