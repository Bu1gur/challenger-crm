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
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="flex gap-6">
          <Sidebar section={section} setSection={setSection} />
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {section === "clients" && (
                <ClientPanel
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
                  groups={groupsState}
                />
              )}
              {section === "admin" && (
                <AdminPanel
                  periods={periodsState}
                  setPeriods={setPeriods}
                  groups={groupsState}
                  setGroups={setGroups}
                  payments={paymentsState}
                  setPayments={setPayments}
                  freezeSettings={freezeSettingsState}
                  setFreezeSettings={setFreezeSettings}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
