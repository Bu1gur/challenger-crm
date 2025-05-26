import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ClientPanel from "./components/ClientPanel";
import TrainerPanel from "./components/TrainerPanel";
import AdminPanel from "./components/AdminPanel";

const App = () => {
  const [section, setSection] = React.useState("clients");
  const [periods, setPeriods] = React.useState([]);
  const [groups, setGroups] = React.useState([]);
  const [payments, setPayments] = React.useState([]);
  const [freezeSettings, setFreezeSettings] = React.useState({});
  const [clients, setClients] = React.useState([]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex gap-8">
          <Sidebar />
          <div className="flex-1">
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setSection("clients")}
                className={
                  section === "clients"
                    ? "font-bold text-blue-700"
                    : "text-gray-500"
                }
              >
                Клиенты
              </button>
              <button
                onClick={() => setSection("trainers")}
                className={
                  section === "trainers"
                    ? "font-bold text-blue-700"
                    : "text-gray-500"
                }
              >
                Тренеры
              </button>
              <button
                onClick={() => setSection("admin")}
                className={
                  section === "admin"
                    ? "font-bold text-blue-700"
                    : "text-gray-500"
                }
              >
                Админка
              </button>
            </div>
            {section === "clients" && (
              <ClientPanel
                clients={clients}
                setClients={setClients}
                periods={periods}
                groups={groups}
                payments={payments}
                freezeSettings={freezeSettings}
                setPeriods={setPeriods}
                setGroups={setGroups}
                setPayments={setPayments}
                setFreezeSettings={setFreezeSettings}
              />
            )}
            {section === "trainers" && (
              <TrainerPanel
                clients={clients}
                setClients={setClients}
                groups={groups}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
