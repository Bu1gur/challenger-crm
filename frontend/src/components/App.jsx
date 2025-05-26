import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import ClientPanel from "./ClientPanel";
import TrainerPanel from "./TrainerPanel";
import AdminPanel from "./AdminPanel";
import { periods, payments, groups, freezeSettings } from "../data/index";

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
      <div className="max-w-[1800px] mx-auto py-8 flex gap-4">
        <Sidebar section={section} setSection={setSection} />
        <main className="flex-1 min-w-0">
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
        </main>
      </div>
    </div>
  );
};

export default App;
