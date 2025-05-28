import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ClientPanel from "./components/ClientPanel";
import TrainerPanel from "./components/TrainerPanel";
import AdminPanel from "./components/AdminPanel";
import { periods, payments, groups, freezeSettings } from "./data/index";

const App = () => {
  const [section, setSection] = React.useState("clients");
  const [periodsState, setPeriods] = React.useState(periods);
  const [groupsState, setGroups] = React.useState(groups);
  const [paymentsState, setPayments] = React.useState(payments);
  const [freezeSettingsState, setFreezeSettings] = React.useState(freezeSettings);
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
            {section === "clients" && (            <ClientPanel
              clients={clients}
              setClients={setClients}
              periods={periodsState}
              groups={groupsState}
              payments={paymentsState}
              freezeSettings={freezeSettingsState}
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
