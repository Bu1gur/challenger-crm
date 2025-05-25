import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const TABS = [
  { key: "periods", label: "Сроки абонемента" },
  { key: "groups", label: "Группы" },
  { key: "payments", label: "Способы оплаты" },
  { key: "freeze", label: "Условия заморозки" },
];

// Модалка подтверждения удаления
function ConfirmModal({ open, text, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col items-center border border-gray-100 animate-fade-in">
        <div className="text-3xl mb-2 text-red-500">⚠️</div>
        <div className="text-lg font-bold mb-4 text-gray-800 text-center">{text}</div>
        <div className="flex gap-4 mt-2">
          <button
            className="px-6 py-2 bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 text-white rounded-xl shadow font-semibold transition-all duration-200"
            onClick={onConfirm}
          >
            Да, удалить
          </button>
          <button
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl shadow font-semibold transition-all duration-200"
            onClick={onCancel}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

const AdminPanel = ({
  periods, setPeriods,
  groups, setGroups,
  payments, setPayments,
  freezeSettings, setFreezeSettings
}) => {
  // --- Состояния для всех справочников ---
  // Периоды
  const [newPeriod, setNewPeriod] = React.useState({ label: "", months: 1, price: "", trainings: "" });
  const [editPeriod, setEditPeriod] = React.useState(null);
  const [periodErrors, setPeriodErrors] = React.useState({});
  const validatePeriod = (period) => {
    const errors = {};
    if (!period.label) errors.label = "Название обязательно";
    if (!period.months || period.months < 1) errors.months = "Мин. 1 месяц";
    if (!period.price || period.price < 1) errors.price = "Укажите цену";
    if (!period.trainings || period.trainings < 1) errors.trainings = "Мин. 1 тренировка";
    return errors;
  };

  // Группы
  const [newGroup, setNewGroup] = React.useState({ name: "", days: [], timeStart: "", timeEnd: "" });
  const [editGroup, setEditGroup] = React.useState(null);
  const [groupErrors, setGroupErrors] = React.useState({});
  const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  const validateGroup = (group) => {
    const errors = {};
    if (!group.name) errors.name = "Название обязательно";
    if (!group.timeStart || !group.timeEnd) errors.time = "Укажите время";
    return errors;
  };

  // Способы оплаты
  const [newPayment, setNewPayment] = React.useState({ label: "", value: "", type: "cash", banks: [] });
  const [editPayment, setEditPayment] = React.useState(null);
  const [paymentErrors, setPaymentErrors] = React.useState({});
  const paymentTypes = [
    { label: "Наличные", value: "cash" },
    { label: "Карта", value: "card" },
    { label: "Перевод", value: "transfer" },
  ];
  const [bankInput, setBankInput] = React.useState("");
  const validatePayment = (payment) => {
    const errors = {};
    if (!payment.label) errors.label = "Название обязательно";
    if (!payment.type) errors.type = "Тип обязателен";
    if (payment.type === "transfer" && (!payment.banks || payment.banks.length === 0)) errors.banks = "Укажите банк";
    return errors;
  };

  // Условия заморозки
  const [maxDays, setMaxDays] = React.useState(freezeSettings.maxDays || 30);
  const [reasons, setReasons] = React.useState(freezeSettings.reasons || []);
  const [reasonInput, setReasonInput] = React.useState("");
  const [requireConfirm, setRequireConfirm] = React.useState(!!freezeSettings.requireConfirm);
  React.useEffect(() => {
    setMaxDays(freezeSettings.maxDays || 30);
    setReasons(freezeSettings.reasons || []);
    setRequireConfirm(!!freezeSettings.requireConfirm);
  }, [freezeSettings]);

  // --- CRUD для всех справочников ---
  // Периоды
  const addPeriod = () => {
    const errors = validatePeriod(newPeriod);
    setPeriodErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setPeriods([
      ...periods,
      {
        label: newPeriod.label,
        value: `${newPeriod.months}m_${Date.now()}`,
        months: Number(newPeriod.months),
        price: Number(newPeriod.price),
        trainings: Number(newPeriod.trainings),
      },
    ]);
    setNewPeriod({ label: "", months: 1, price: "", trainings: "" });
    setPeriodErrors({});
  };
  const startEditPeriod = (p) => setEditPeriod({ ...p });
  const saveEditPeriod = () => {
    const errors = validatePeriod(editPeriod);
    setPeriodErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setPeriods(periods.map(p => p.value === editPeriod.value ? editPeriod : p));
    setEditPeriod(null);
    setPeriodErrors({});
  };

  // Группы
  const toggleDay = (day, groupObj, setGroupObj) => {
    setGroupObj(g => ({ ...g, days: g.days.includes(day) ? g.days.filter(d => d !== day) : [...g.days, day] }));
  };
  const addGroup = () => {
    const errors = validateGroup(newGroup);
    setGroupErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setGroups([...groups, { ...newGroup, value: `g${Date.now()}` }]);
    setNewGroup({ name: "", days: [], timeStart: "", timeEnd: "" });
    setGroupErrors({});
  };
  const startEditGroup = (g) => setEditGroup({ ...g });
  const saveEditGroup = () => {
    const errors = validateGroup(editGroup);
    setGroupErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setGroups(groups.map(g => g.value === editGroup.value ? editGroup : g));
    setEditGroup(null);
    setGroupErrors({});
  };

  // Способы оплаты
  const addBankToPayment = (edit = false) => {
    if (!bankInput) return;
    if (edit) {
      setEditPayment(p => ({ ...p, banks: [...(p.banks || []), bankInput] }));
    } else {
      setNewPayment(p => ({ ...p, banks: [...(p.banks || []), bankInput] }));
    }
    setBankInput("");
  };
  const removeBankFromPayment = (bank, edit = false) => {
    if (edit) {
      setEditPayment(p => ({ ...p, banks: (p.banks || []).filter(b => b !== bank) }));
    } else {
      setNewPayment(p => ({ ...p, banks: (p.banks || []).filter(b => b !== bank) }));
    }
  };
  const addPayment = () => {
    const errors = validatePayment(newPayment);
    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setPayments([
      ...payments,
      {
        label: newPayment.label,
        value: newPayment.type + "_" + Date.now(),
        type: newPayment.type,
        banks: newPayment.type === "transfer" ? newPayment.banks : [],
      },
    ]);
    setNewPayment({ label: "", value: "", type: "cash", banks: [] });
    setPaymentErrors({});
  };
  const startEditPayment = (p) => setEditPayment({ ...p });
  const saveEditPayment = () => {
    const errors = validatePayment(editPayment);
    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setPayments(payments.map(p => p.value === editPayment.value ? editPayment : p));
    setEditPayment(null);
    setPaymentErrors({});
  };

  // Условия заморозки
  const saveFreezeSettings = () => {
    setFreezeSettings({ maxDays, reasons, requireConfirm });
  };
  const addReason = () => {
    if (reasonInput && !reasons.includes(reasonInput)) {
      setReasons([...reasons, reasonInput]);
      setReasonInput("");
    }
  };
  const removeReason = (r) => setReasons(reasons.filter(x => x !== r));

  // --- Модалка подтверждения удаления ---
  const [confirm, setConfirm] = React.useState({ open: false, type: null, value: null });
  const askRemovePeriod = (label) => setConfirm({ open: true, type: "period", value: label });
  const askRemoveGroup = (value) => setConfirm({ open: true, type: "group", value });
  const askRemovePayment = (value) => setConfirm({ open: true, type: "payment", value });
  const handleConfirmDelete = () => {
    if (confirm.type === "period") setPeriods(periods.filter((x) => x.label !== confirm.value));
    if (confirm.type === "group") setGroups(groups.filter((x) => x.value !== confirm.value));
    if (confirm.type === "payment") setPayments(payments.filter((x) => x.value !== confirm.value));
    setConfirm({ open: false, type: null, value: null });
  };

  // --- Экспорт/импорт справочников ---
  const handleExportRefs = () => {
    const wb = XLSX.utils.book_new();
    wb.Props = { Title: "Справочники CRM" };
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(periods), "Периоды");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(groups), "Группы");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(payments), "Оплата");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([freezeSettings]), "Заморозка");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `refs_${new Date().toISOString().slice(0,10)}.xlsx`);
  };
  const handleImportRefs = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const periodsSheet = workbook.Sheets["Периоды"];
      if (periodsSheet && setPeriods) setPeriods(XLSX.utils.sheet_to_json(periodsSheet));
      const groupsSheet = workbook.Sheets["Группы"];
      if (groupsSheet && setGroups) setGroups(XLSX.utils.sheet_to_json(groupsSheet));
      const paymentsSheet = workbook.Sheets["Оплата"];
      if (paymentsSheet && setPayments) setPayments(XLSX.utils.sheet_to_json(paymentsSheet));
      const freezeSheet = workbook.Sheets["Заморозка"];
      if (freezeSheet && setFreezeSettings) {
        const arr = XLSX.utils.sheet_to_json(freezeSheet);
        if (arr && arr[0]) setFreezeSettings(arr[0]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Добавить это состояние для вкладок:
  const [tab, setTab] = React.useState("periods");

  return (
    <div className="max-w-[98vw] 2xl:max-w-[1600px] mx-auto bg-white rounded-3xl shadow-2xl p-4 sm:p-10 mt-2 sm:mt-8 border border-gray-100 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-2 sm:mb-0">
          Админ-панель
        </h2>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-300 hover:from-blue-200 hover:to-blue-400 text-blue-800 px-6 py-2 rounded-xl shadow font-semibold transition-all duration-200"
            onClick={handleExportRefs}
          >
            {/* Иконка "выгрузка" (Tabler/Download) */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
              <path d="M4 17h16" />
            </svg>
            <span>Экспорт справочников</span>
          </button>
          <label className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-green-300 hover:from-green-200 hover:to-green-400 text-green-800 px-6 py-2 rounded-xl shadow font-semibold transition-all duration-200 cursor-pointer">
            {/* Иконка "загрузка" (Tabler/Upload) */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 21V9m0 0l-4 4m4-4l4 4" />
              <path d="M4 7h16" />
            </svg>
            <span>Импорт справочников</span>
            <input type="file" accept=".xlsx,.xls" onChange={handleImportRefs} className="hidden" />
          </label>
        </div>
      </div>
      <div className="flex gap-3 mb-8 justify-center">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`relative px-7 py-3 rounded-full font-bold text-base transition-all duration-200
              ${tab === t.key
                ? "bg-white text-blue-700 shadow-lg after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-2/3 after:h-1 after:bg-blue-400 after:rounded-full after:shadow-[0_0_8px_2px_rgba(59,130,246,0.25)]"
                : "bg-gray-100 text-blue-700 hover:bg-blue-50"}
            `}
            onClick={() => setTab(t.key)}
            style={{ boxShadow: tab === t.key ? "0 4px 24px 0 #c7d2fe" : undefined }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Справочник: Сроки абонемента */}
      {tab === "periods" && (
        <div className="mb-10 border-b pb-8 min-w-[480px]">
          <h3 className="font-bold mb-6 text-blue-700 text-2xl flex items-center gap-2">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5" /><path d="M8 12h8M12 8v8" /></svg>
            Сроки абонемента
          </h3>
          <div className="flex gap-4 mb-6 flex-wrap items-end bg-[#F5F7FB] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col gap-1">
              <input value={newPeriod.label} onChange={e => { setNewPeriod(p => ({ ...p, label: e.target.value })); setPeriodErrors(errors => ({ ...errors, label: undefined })); }} className={`border-2 rounded-xl px-3 py-2 w-40 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base ${periodErrors.label ? "border-red-400" : "border-gray-200"}`} placeholder="Название" />
              {periodErrors.label && <span className="text-red-500 text-xs">{periodErrors.label}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <input value={newPeriod.months} onChange={e => { setNewPeriod(p => ({ ...p, months: e.target.value })); setPeriodErrors(errors => ({ ...errors, months: undefined })); }} className={`border-2 rounded-xl px-3 py-2 w-16 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base ${periodErrors.months ? "border-red-400" : "border-gray-200"}`} placeholder="Мес." type="number" min={1} />
              {periodErrors.months && <span className="text-red-500 text-xs">{periodErrors.months}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <input value={newPeriod.price} onChange={e => { setNewPeriod(p => ({ ...p, price: e.target.value })); setPeriodErrors(errors => ({ ...errors, price: undefined })); }} className={`border-2 rounded-xl px-3 py-2 w-24 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base ${periodErrors.price ? "border-red-400" : "border-gray-200"}`} placeholder="Сумма" type="number" min={0} />
              {periodErrors.price && <span className="text-red-500 text-xs">{periodErrors.price}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <input value={newPeriod.trainings} onChange={e => { setNewPeriod(p => ({ ...p, trainings: e.target.value })); setPeriodErrors(errors => ({ ...errors, trainings: undefined })); }} className={`border-2 rounded-xl px-3 py-2 w-24 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base ${periodErrors.trainings ? "border-red-400" : "border-gray-200"}`} placeholder="Тренировок" type="number" min={1} />
              {periodErrors.trainings && <span className="text-red-500 text-xs">{periodErrors.trainings}</span>}
            </div>
            <button
              onClick={addPeriod}
              className="ml-1 flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white font-bold text-base shadow transition-all duration-200 active:scale-95"
              style={{ minWidth: 36, minHeight: 36 }}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>
          <ul className="flex flex-col gap-4">
            {periods.map((p) => (
              <li key={p.value} className="relative bg-[#F5F7FB] px-8 py-5 rounded-2xl flex items-center gap-6 shadow text-lg font-medium flex-wrap break-all group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fade-in" style={{ minHeight: 56 }}>
                {editPeriod && editPeriod.value === p.value ? (
                  <>
                    <input value={editPeriod.label} onChange={e => setEditPeriod(ep => ({ ...ep, label: e.target.value }))} className="w-28 border rounded px-2 py-1 text-sm" />
                    <input value={editPeriod.months} type="number" min={1} onChange={e => setEditPeriod(ep => ({ ...ep, months: e.target.value }))} className="w-12 border rounded px-2 py-1 text-sm" />
                    <input value={editPeriod.price} type="number" min={0} onChange={e => setEditPeriod(ep => ({ ...ep, price: e.target.value }))} className="w-20 border rounded px-2 py-1 text-sm" />
                    <input value={editPeriod.trainings} type="number" min={1} onChange={e => setEditPeriod(ep => ({ ...ep, trainings: e.target.value }))} className="w-20 border rounded px-2 py-1 text-sm" />
                    <button onClick={saveEditPeriod} className="text-green-600 font-bold text-xl">✔</button>
                    <button onClick={() => setEditPeriod(null)} className="text-gray-400 font-bold text-xl">✖</button>
                  </>
                ) : (
                  <>
                    <span className="break-all flex-1">{p.label} — {p.months} мес, <b>{p.price} сом</b>, <b>{p.trainings || 0} трен.</b></span>
                    <button
                      onClick={() => startEditPeriod(p)}
                      className="p-2 rounded-lg hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition"
                      title="Редактировать"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => askRemovePeriod(p.label)}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition"
                      title="Удалить"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Справочник: Группы */}
      {tab === "groups" && (
        <div className="mb-10 border-b pb-8 min-w-[480px]">
          <h3 className="font-bold mb-6 text-blue-700 text-2xl flex items-center gap-2">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5" /><path d="M8 12h8M12 8v8" /></svg>
            Группы
          </h3>
          <div className="flex gap-4 mb-6 flex-wrap items-end bg-[#F5F7FB] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col gap-1">
              <input value={newGroup.name} onChange={e => { setNewGroup(g => ({ ...g, name: e.target.value })); setGroupErrors(errors => ({ ...errors, name: undefined })); }} className={`border-2 rounded-xl px-3 py-2 w-40 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base ${groupErrors.name ? "border-red-400" : "border-gray-200"}`} placeholder="Название" />
              {groupErrors.name && <span className="text-red-500 text-xs">{groupErrors.name}</span>}
            </div>
            <div className="flex gap-1 items-center">
              {weekDays.map(day => (
                <label key={day} className={`px-2 py-1 rounded-lg cursor-pointer text-xs font-semibold transition ${newGroup.days.includes(day) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <input type="checkbox" checked={newGroup.days.includes(day)} onChange={() => toggleDay(day, newGroup, setNewGroup)} className="hidden" />
                  {day}
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 mb-1">Время начала</label>
              <input
                type="time"
                value={newGroup.timeStart}
                onChange={e => setNewGroup(g => ({ ...g, timeStart: e.target.value }))}
                className={`border-2 rounded-xl px-3 py-2 w-28 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base ${groupErrors.time ? "border-red-400" : "border-gray-200"}`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 mb-1">Время окончания</label>
              <input
                type="time"
                value={newGroup.timeEnd}
                onChange={e => setNewGroup(g => ({ ...g, timeEnd: e.target.value }))}
                className={`border-2 rounded-xl px-3 py-2 w-28 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base ${groupErrors.time ? "border-red-400" : "border-gray-200"}`}
              />
              {groupErrors.time && <span className="text-red-500 text-xs">{groupErrors.time}</span>}
            </div>
            <button
              onClick={addGroup}
              className="ml-1 flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white font-bold text-base shadow transition-all duration-200 active:scale-95"
              style={{ minWidth: 36, minHeight: 36 }}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>
          <ul className="flex flex-col gap-4">
            {groups.map((g) => (
              <li key={g.value} className="relative bg-[#F5F7FB] px-8 py-5 rounded-2xl flex items-center gap-6 shadow text-lg font-medium flex-wrap break-all group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fade-in" style={{ minHeight: 56 }}>
                {editGroup && editGroup.value === g.value ? (
                  <>
                    <input value={editGroup.name} onChange={e => setEditGroup(eg => ({ ...eg, name: e.target.value }))} className="w-28 border rounded px-2 py-1 text-sm" />
                    <div className="flex gap-1">
                      {weekDays.map(day => (
                        <label key={day} className={`px-2 py-1 rounded-lg cursor-pointer text-xs font-semibold transition ${editGroup.days.includes(day) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                          <input type="checkbox" checked={editGroup.days.includes(day)} onChange={() => toggleDay(day, editGroup, setEditGroup)} className="hidden" />
                          {day}
                        </label>
                      ))}
                    </div>
                    <input
                      type="time"
                      value={editGroup.timeStart || ""}
                      onChange={e => setEditGroup(eg => ({ ...eg, timeStart: e.target.value }))}
                      className="w-24 border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="time"
                      value={editGroup.timeEnd || ""}
                      onChange={e => setEditGroup(eg => ({ ...eg, timeEnd: e.target.value }))}
                      className="w-24 border rounded px-2 py-1 text-sm"
                    />
                    <button onClick={saveEditGroup} className="text-green-600 font-bold text-xl">✔</button>
                    <button onClick={() => setEditGroup(null)} className="text-gray-400 font-bold text-xl">✖</button>
                  </>
                ) : (
                  <>
                    <span className="break-all flex-1">
                      {g.name}
                      {g.days.length > 0 && (
                        <span className="text-xs text-gray-500"> ({g.days.join(", ")})</span>
                      )}
                      {(g.timeStart && g.timeEnd) && (
                        <span className="text-xs text-blue-500 ml-2">
                          {g.timeStart}–{g.timeEnd}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => startEditGroup(g)}
                      className="p-2 rounded-lg hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition"
                      title="Редактировать"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => askRemoveGroup(g.value)}
                      className="p-2 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition"
                      title="Удалить"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Справочник: Способы оплаты */}
      {tab === "payments" && (
        <div className="mb-10 border-b pb-8 min-w-[480px]">
          <h3 className="font-bold mb-6 text-blue-700 text-2xl flex items-center gap-2">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5" /><path d="M8 12h8M12 8v8" /></svg>
            Способы оплаты
          </h3>
          <div className="flex gap-4 mb-6 flex-wrap items-end bg-[#F5F7FB] rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col gap-1">
              <input value={newPayment.label} onChange={e => { setNewPayment(p => ({ ...p, label: e.target.value })); setPaymentErrors(errors => ({ ...errors, label: undefined })); }} className={`border-2 rounded-xl px-3 py-2 w-40 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base ${paymentErrors.label ? "border-red-400" : "border-gray-200"}`} placeholder="Название" />
              {paymentErrors.label && <span className="text-red-500 text-xs">{paymentErrors.label}</span>}
            </div>
            <select value={newPayment.type} onChange={e => setNewPayment(p => ({ ...p, type: e.target.value, value: e.target.value, banks: e.target.value === 'transfer' ? p.banks : [] }))} className="border-2 rounded-xl px-3 py-2 w-28 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base">
              {paymentTypes.map(pt => (
                <option key={pt.value} value={pt.value}>{pt.label}</option>
              ))}
            </select>
            {newPayment.type === "transfer" && (
              <>
                <input value={bankInput} onChange={e => setBankInput(e.target.value)} className="border-2 rounded-xl px-3 py-2 w-28 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base" placeholder="Банк" />
                <button onClick={() => addBankToPayment(false)} className="bg-gradient-to-r from-blue-200 to-blue-400 hover:from-blue-300 hover:to-blue-500 text-blue-800 px-2 py-1 rounded-lg shadow font-bold text-xs transition-all duration-200">+ банк</button>
                <ul className="flex gap-1">
                  {(newPayment.banks || []).map(b => (
                    <li key={b} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1 text-xs">
                      {b}
                      <button onClick={() => removeBankFromPayment(b, false)} className="text-red-400 hover:text-red-600 ml-1">×</button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button
              onClick={addPayment}
              className="ml-1 flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white font-bold text-base shadow transition-all duration-200 active:scale-95"
              style={{ minWidth: 36, minHeight: 36 }}
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>
          <ul className="flex flex-col gap-4">
            {payments.map((m) => (
              <li key={m.value} className="relative bg-[#F5F7FB] px-8 py-5 rounded-2xl flex items-center gap-6 shadow text-lg font-medium flex-wrap break-all group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl animate-fade-in" style={{ minHeight: 56 }}>
                {editPayment && editPayment.value === m.value ? (
                  <>
                    <input value={editPayment.label} onChange={e => setEditPayment(ep => ({ ...ep, label: e.target.value }))} className="w-28 border rounded px-2 py-1 text-sm" />
                    <select value={editPayment.type} onChange={e => setEditPayment(ep => ({ ...ep, type: e.target.value, value: e.target.value, banks: e.target.value === 'transfer' ? ep.banks : [] }))} className="w-24 border rounded px-2 py-1 text-sm">
                      {paymentTypes.map(pt => (
                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                      ))}
                    </select>
                    {editPayment.type === "transfer" && (
                      <>
                        <input value={bankInput} onChange={e => setBankInput(e.target.value)} className="border-2 rounded-xl px-3 py-2 w-28 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base" placeholder="Банк" />
                        <button onClick={() => addBankToPayment(true)} className="bg-gradient-to-r from-blue-200 to-blue-400 hover:from-blue-300 hover:to-blue-500 text-blue-800 px-2 py-1 rounded-lg shadow font-bold text-xs transition-all duration-200">+ банк</button>
                        <ul className="flex gap-1">
                          {(editPayment.banks || []).map(b => (
                            <li key={b} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1 text-xs">
                              {b}
                              <button onClick={() => removeBankFromPayment(b, true)} className="text-red-400 hover:text-red-600 ml-1">×</button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    <button onClick={saveEditPayment} className="text-green-600 font-bold text-xl">✔</button>
                    <button onClick={() => setEditPayment(null)} className="text-gray-400 font-bold text-xl">✖</button>
                  </>
                ) : (
                  <>
                    <span className="break-all flex-1">{m.label} <span className="text-xs text-gray-400">({paymentTypes.find(pt => pt.value === m.type)?.label})</span>
                      {m.type === "transfer" && m.banks && m.banks.length > 0 && (
                        <span className="text-xs text-gray-500 ml-2">[{m.banks.join(", ")}]</span>
                      )}
                    </span>
                    <button onClick={() => startEditPayment(m)} className="p-2 rounded-lg hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition" title="Редактировать">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" />
                      </svg>
                    </button>
                    <button onClick={() => askRemovePayment(m.value)} className="p-2 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600 transition" title="Удалить">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Справочник: Условия заморозки */}
      {tab === "freeze" && (
        <div className="mb-10 min-w-[480px]">
          <h3 className="font-bold mb-6 text-blue-700 text-2xl flex items-center gap-2">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="5" /><path d="M8 12h8M12 8v8" /></svg>
            Условия заморозки
          </h3>
          <div className="flex gap-4 mb-6 flex-wrap items-end bg-[#F5F7FB] rounded-2xl p-6 shadow-lg">
            <label className="text-sm">Максимум дней:</label>
            <input type="number" min={1} value={maxDays} onChange={e => setMaxDays(Number(e.target.value))} className="border-2 rounded-xl px-3 py-2 w-20 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base" />
            <label className="text-sm ml-2">Причины:</label>
            <input value={reasonInput} onChange={e => setReasonInput(e.target.value)} className="border-2 rounded-xl px-3 py-2 w-36 bg-white focus:ring-2 focus:ring-blue-200 focus:outline-none text-base" placeholder="Добавить причину" />
            <button onClick={addReason} className="bg-gradient-to-r from-blue-200 to-blue-400 hover:from-blue-300 hover:to-blue-500 text-blue-800 px-2 py-1 rounded-lg shadow font-bold text-xs transition-all duration-200">+</button>
            <ul className="flex gap-1 ml-2">
              {reasons.map(r => (
                <li key={r} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-1 text-xs">
                  {r}
                  <button onClick={() => removeReason(r)} className="text-red-400 hover:text-red-600 ml-1">×</button>
                </li>
              ))}
            </ul>
            <label className="ml-4 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={requireConfirm} onChange={e => setRequireConfirm(e.target.checked)} />
              Требуется подтверждение
            </label>
            <button onClick={saveFreezeSettings} className="ml-4 bg-gradient-to-r from-blue-100 to-blue-300 hover:from-blue-200 hover:to-blue-400 text-blue-800 px-4 py-2 rounded-xl shadow font-bold text-sm transition">Сохранить</button>
          </div>
          <div className="text-base text-gray-400 mt-2">Эти параметры используются при оформлении заморозки в карточке клиента.</div>
        </div>
      )}
      <div className="text-base text-gray-400 text-center mt-10">Все справочники используются в формах клиентов и доступны для редактирования в любой момент.</div>
      <ConfirmModal
        open={confirm.open}
        text="Вы уверены, что хотите удалить этот элемент? Это действие нельзя отменить."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirm({ open: false, type: null, value: null })}
      />
    </div>
  );
};

export default AdminPanel;
