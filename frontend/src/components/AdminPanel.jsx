import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { API_ENDPOINTS } from "../config/api";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div className="text-center">
          <div className="text-3xl mb-2 text-red-500">⚠️</div>
          <div className="text-lg font-semibold mb-4 text-gray-800">{text}</div>
          <div className="flex gap-3 justify-center mt-4">
            <button
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              onClick={onConfirm}
            >
              Да, удалить
            </button>
            <button
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium"
              onClick={onCancel}
            >
              Отмена
            </button>
          </div>
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
  const [tab, setTab] = useState("periods");

  // --- CRUD для справочников через сервер ---
  useEffect(() => {
    fetch(API_ENDPOINTS.PERIODS).then(res => res.json()).then(setPeriods).catch(() => setPeriods([]));
    fetch(API_ENDPOINTS.GROUPS).then(res => res.json()).then(setGroups).catch(() => setGroups([]));
    fetch(API_ENDPOINTS.PAYMENTS).then(res => res.json()).then(setPayments).catch(() => setPayments([]));
    fetch(API_ENDPOINTS.FREEZE_SETTINGS).then(res => res.json()).then(arr => setFreezeSettings(arr[0] || {})).catch(() => setFreezeSettings({}));
  }, [setPeriods, setGroups, setPayments, setFreezeSettings]);

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
  const addPeriod = async () => {
    const errors = validatePeriod(newPeriod);
    setPeriodErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.PERIODS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newPeriod.label,
          value: `${newPeriod.months}m_${Date.now()}`,
          months: Number(newPeriod.months),
          price: Number(newPeriod.price),
          trainings: Number(newPeriod.trainings),
        })
      });
      if (response.ok) {
        const createdPeriod = await response.json();
        setPeriods([...periods, createdPeriod]);
        setNewPeriod({ label: "", months: 1, price: "", trainings: "" });
        setPeriodErrors({});
      }
    } catch (error) {
      console.error('Error creating period:', error);
    }
  };
  
  const startEditPeriod = (p) => setEditPeriod({ ...p });
  
  const saveEditPeriod = async () => {
    const errors = validatePeriod(editPeriod);
    setPeriodErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.PERIODS}/${editPeriod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editPeriod.label,
          value: editPeriod.value,
          months: Number(editPeriod.months),
          price: Number(editPeriod.price),
          trainings: Number(editPeriod.trainings),
        })
      });
      if (response.ok) {
        const updatedPeriod = await response.json();
        setPeriods(periods.map(p => p.id === editPeriod.id ? updatedPeriod : p));
        setEditPeriod(null);
        setPeriodErrors({});
      }
    } catch (error) {
      console.error('Error updating period:', error);
    }
  };
  
  const deletePeriod = async (id) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PERIODS}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setPeriods(periods.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting period:', error);
    }
  };

  // Группы
  const toggleDay = (day, groupObj, setGroupObj) => {
    setGroupObj(g => ({ ...g, days: g.days.includes(day) ? g.days.filter(d => d !== day) : [...g.days, day] }));
  };
  
  const addGroup = async () => {
    const errors = validateGroup(newGroup);
    setGroupErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.GROUPS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroup.name,
          days: newGroup.days.join(','),
          time_start: newGroup.timeStart,
          time_end: newGroup.timeEnd,
          comment: newGroup.comment || ''
        })
      });
      if (response.ok) {
        const createdGroup = await response.json();
        setGroups([...groups, createdGroup]);
        setNewGroup({ name: "", days: [], timeStart: "", timeEnd: "" });
        setGroupErrors({});
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };
  
  const startEditGroup = (g) => setEditGroup({ ...g, days: g.days ? g.days.split(',') : [] });
  
  const saveEditGroup = async () => {
    const errors = validateGroup(editGroup);
    setGroupErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.GROUPS}/${editGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editGroup.name,
          days: editGroup.days.join(','),
          time_start: editGroup.timeStart,
          time_end: editGroup.timeEnd,
          comment: editGroup.comment || ''
        })
      });
      if (response.ok) {
        const updatedGroup = await response.json();
        setGroups(groups.map(g => g.id === editGroup.id ? updatedGroup : g));
        setEditGroup(null);
        setGroupErrors({});
      }
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };
  
  const deleteGroup = async (id) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.GROUPS}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setGroups(groups.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error('Error deleting group:', error);
    }
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
  const addPayment = async () => {
    const errors = validatePayment(newPayment);
    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.PAYMENTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newPayment.label,
          value: newPayment.type + "_" + Date.now(),
          type: newPayment.type,
          banks: newPayment.type === "transfer" ? newPayment.banks : [],
        })
      });
      if (response.ok) {
        const createdPayment = await response.json();
        setPayments([...payments, createdPayment]);
        setNewPayment({ label: "", value: "", type: "cash", banks: [] });
        setPaymentErrors({});
      }
    } catch (error) {
      console.error('Error creating payment:', error);
    }
  };
  
  const startEditPayment = (p) => setEditPayment({ ...p });
  
  const saveEditPayment = async () => {
    const errors = validatePayment(editPayment);
    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.PAYMENTS}/${editPayment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: editPayment.label,
          value: editPayment.value,
          type: editPayment.type,
          banks: editPayment.type === "transfer" ? editPayment.banks : [],
        })
      });
      if (response.ok) {
        const updatedPayment = await response.json();
        setPayments(payments.map(p => p.id === editPayment.id ? updatedPayment : p));
        setEditPayment(null);
        setPaymentErrors({});
      }
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };
  
  const deletePayment = async (id) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PAYMENTS}/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setPayments(payments.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  // Условия заморозки
  const saveFreezeSettings = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.FREEZE_SETTINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxDays, reasons, requireConfirm })
      });
      if (response.ok) {
        const updatedSettings = await response.json();
        setFreezeSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Error saving freeze settings:', error);
    }
  };
  const addReason = () => {
    if (reasonInput && !reasons.includes(reasonInput)) {
      setReasons([...reasons, reasonInput]);
      setReasonInput("");
    }
  };
  const removeReason = (r) => setReasons(reasons.filter(x => x !== r));

  // --- Модалка подтверждения удаления ---
  const [confirm, setConfirm] = React.useState({ open: false, type: null, value: null, id: null });
  const askRemovePeriod = (id, label) => setConfirm({ open: true, type: "period", value: label, id });
  const askRemoveGroup = (id, name) => setConfirm({ open: true, type: "group", value: name, id });
  const askRemovePayment = (id, label) => setConfirm({ open: true, type: "payment", value: label, id });
  const handleConfirmDelete = () => {
    if (confirm.type === "period") deletePeriod(confirm.id);
    if (confirm.type === "group") deleteGroup(confirm.id);
    if (confirm.type === "payment") deletePayment(confirm.id);
    setConfirm({ open: false, type: null, value: null, id: null });
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

  return (
    <div className="space-y-6">
      {/* Заголовок и кнопки экспорта/импорта */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Админ-панель
        </h2>
        <div className="flex gap-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
            onClick={handleExportRefs}
          >
            Экспорт справочников
          </button>
          <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm cursor-pointer">
            Импорт справочников
            <input type="file" accept=".xlsx,.xls" onChange={handleImportRefs} className="hidden" />
          </label>
        </div>
      </div>

      {/* Табы навигации */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                tab === t.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Справочник: Сроки абонемента */}
      {tab === "periods" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Сроки абонемента
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-4 flex-wrap items-end">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Название</label>
                <input 
                  value={newPeriod.label} 
                  onChange={e => { 
                    setNewPeriod(p => ({ ...p, label: e.target.value })); 
                    setPeriodErrors(errors => ({ ...errors, label: undefined })); 
                  }} 
                  className={`border rounded-lg px-3 py-2 w-40 ${periodErrors.label ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                  placeholder="Название" 
                />
                {periodErrors.label && <span className="text-red-500 text-xs mt-1">{periodErrors.label}</span>}
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Месяцев</label>
                <input 
                  value={newPeriod.months} 
                  onChange={e => { 
                    setNewPeriod(p => ({ ...p, months: e.target.value })); 
                    setPeriodErrors(errors => ({ ...errors, months: undefined })); 
                  }} 
                  className={`border rounded-lg px-3 py-2 w-20 ${periodErrors.months ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                  type="number" 
                  min={1} 
                />
                {periodErrors.months && <span className="text-red-500 text-xs mt-1">{periodErrors.months}</span>}
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Цена</label>
                <input 
                  value={newPeriod.price} 
                  onChange={e => { 
                    setNewPeriod(p => ({ ...p, price: e.target.value })); 
                    setPeriodErrors(errors => ({ ...errors, price: undefined })); 
                  }} 
                  className={`border rounded-lg px-3 py-2 w-28 ${periodErrors.price ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                  type="number" 
                  min={0} 
                />
                {periodErrors.price && <span className="text-red-500 text-xs mt-1">{periodErrors.price}</span>}
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Тренировок</label>
                <input 
                  value={newPeriod.trainings} 
                  onChange={e => { 
                    setNewPeriod(p => ({ ...p, trainings: e.target.value })); 
                    setPeriodErrors(errors => ({ ...errors, trainings: undefined })); 
                  }} 
                  className={`border rounded-lg px-3 py-2 w-28 ${periodErrors.trainings ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                  type="number" 
                  min={1} 
                />
                {periodErrors.trainings && <span className="text-red-500 text-xs mt-1">{periodErrors.trainings}</span>}
              </div>
              <button
                onClick={addPeriod}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                type="button"
              >
                Добавить
              </button>
            </div>
          </div>
          
          {/* Список периодов */}
          <div className="space-y-2">
            {periods.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                {editPeriod && editPeriod.id === p.id ? (
                  <div className="flex gap-4 items-center flex-1">
                    <input 
                      value={editPeriod.label} 
                      onChange={e => setEditPeriod(ep => ({ ...ep, label: e.target.value }))} 
                      className="border rounded-lg px-3 py-2 w-32" 
                    />
                    <input 
                      value={editPeriod.months} 
                      onChange={e => setEditPeriod(ep => ({ ...ep, months: e.target.value }))} 
                      className="border rounded-lg px-3 py-2 w-16" 
                      type="number" 
                    />
                    <input 
                      value={editPeriod.price} 
                      onChange={e => setEditPeriod(ep => ({ ...ep, price: e.target.value }))} 
                      className="border rounded-lg px-3 py-2 w-20" 
                      type="number" 
                    />
                    <input 
                      value={editPeriod.trainings} 
                      onChange={e => setEditPeriod(ep => ({ ...ep, trainings: e.target.value }))} 
                      className="border rounded-lg px-3 py-2 w-20" 
                      type="number" 
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEditPeriod} className="text-green-600 hover:text-green-700 p-1">✓</button>
                      <button onClick={() => setEditPeriod(null)} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="font-medium">{p.label}</span>
                      <span className="text-gray-500 ml-2">({p.months} мес., {p.price}₽, {p.trainings} тренировок)</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEditPeriod(p)} 
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => askRemovePeriod(p.id, p.label)} 
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Справочник: Группы */}
      {tab === "groups" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Группы
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 flex-wrap items-end">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Название</label>
                  <input 
                    value={newGroup.name} 
                    onChange={e => { 
                      setNewGroup(g => ({ ...g, name: e.target.value })); 
                      setGroupErrors(errors => ({ ...errors, name: undefined })); 
                    }} 
                    className={`border rounded-lg px-3 py-2 w-40 ${groupErrors.name ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                    placeholder="Название" 
                  />
                  {groupErrors.name && <span className="text-red-500 text-xs mt-1">{groupErrors.name}</span>}
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Время начала</label>
                  <input
                    type="time"
                    value={newGroup.timeStart}
                    onChange={e => setNewGroup(g => ({ ...g, timeStart: e.target.value }))}
                    className={`border rounded-lg px-3 py-2 w-28 ${groupErrors.time ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Время окончания</label>
                  <input
                    type="time"
                    value={newGroup.timeEnd}
                    onChange={e => setNewGroup(g => ({ ...g, timeEnd: e.target.value }))}
                    className={`border rounded-lg px-3 py-2 w-28 ${groupErrors.time ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  {groupErrors.time && <span className="text-red-500 text-xs mt-1">{groupErrors.time}</span>}
                </div>
                <button
                  onClick={addGroup}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                  type="button"
                >
                  Добавить
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Дни недели:</span>
                {weekDays.map(day => (
                  <label key={day} className={`px-3 py-1 rounded-lg cursor-pointer text-sm font-medium ${newGroup.days.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}> 
                    <input type="checkbox" checked={newGroup.days.includes(day)} onChange={() => toggleDay(day, newGroup, setNewGroup)} className="hidden" />
                    {day}
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Список групп */}
          <div className="space-y-2">
            {groups.map((g) => (
              <div key={g.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                {editGroup && editGroup.id === g.id ? (
                  <div className="flex gap-4 items-center flex-1 flex-wrap">
                    <input 
                      value={editGroup.name} 
                      onChange={e => setEditGroup(eg => ({ ...eg, name: e.target.value }))} 
                      className="border rounded-lg px-3 py-2 w-32" 
                    />
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map(day => (
                        <label key={day} className={`px-2 py-1 rounded cursor-pointer text-xs ${editGroup.days.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}> 
                          <input type="checkbox" checked={editGroup.days.includes(day)} onChange={() => toggleDay(day, editGroup, setEditGroup)} className="hidden" />
                          {day}
                        </label>
                      ))}
                    </div>
                    <input
                      type="time"
                      value={editGroup.timeStart || ""}
                      onChange={e => setEditGroup(eg => ({ ...eg, timeStart: e.target.value }))}
                      className="border rounded-lg px-3 py-2 w-24"
                    />
                    <input
                      type="time"
                      value={editGroup.timeEnd || ""}
                      onChange={e => setEditGroup(eg => ({ ...eg, timeEnd: e.target.value }))}
                      className="border rounded-lg px-3 py-2 w-24"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEditGroup} className="text-green-600 hover:text-green-700 p-1">✓</button>
                      <button onClick={() => setEditGroup(null)} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="font-medium">{g.name}</span>
                      {Array.isArray(g.days) && g.days.length > 0 && (
                        <span className="text-gray-500 ml-2">({g.days.join(", ")})</span>
                      )}
                      {(g.timeStart && g.timeEnd) && (
                        <span className="text-blue-600 ml-2">
                          {g.timeStart}–{g.timeEnd}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEditGroup(g)} 
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => askRemoveGroup(g.id, g.name)} 
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Справочник: Способы оплаты */}
      {tab === "payments" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Способы оплаты
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex gap-4 flex-wrap items-end">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Название</label>
                <input 
                  value={newPayment.label} 
                  onChange={e => { 
                    setNewPayment(p => ({ ...p, label: e.target.value })); 
                    setPaymentErrors(errors => ({ ...errors, label: undefined })); 
                  }} 
                  className={`border rounded-lg px-3 py-2 w-40 ${paymentErrors.label ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                  placeholder="Название" 
                />
                {paymentErrors.label && <span className="text-red-500 text-xs mt-1">{paymentErrors.label}</span>}
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Тип</label>
                <select 
                  value={newPayment.type} 
                  onChange={e => setNewPayment(p => ({ ...p, type: e.target.value, value: e.target.value, banks: e.target.value === 'transfer' ? p.banks : [] }))} 
                  className="border rounded-lg px-3 py-2 w-28 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paymentTypes.map(pt => (
                    <option key={pt.value} value={pt.value}>{pt.label}</option>
                  ))}
                </select>
              </div>
              {newPayment.type === "transfer" && (
                <>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Банк</label>
                    <div className="flex gap-2">
                      <input 
                        value={bankInput} 
                        onChange={e => setBankInput(e.target.value)} 
                        className="border rounded-lg px-3 py-2 w-28 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        placeholder="Банк" 
                      />
                      <button onClick={() => addBankToPayment(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+</button>
                    </div>
                  </div>
                  {newPayment.banks && newPayment.banks.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {newPayment.banks.map(b => (
                        <span key={b} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1">
                          {b}
                          <button onClick={() => removeBankFromPayment(b, false)} className="text-red-600 hover:text-red-800">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
              <button
                onClick={addPayment}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                type="button"
              >
                Добавить
              </button>
            </div>
          </div>
          
          {/* Список способов оплаты */}
          <div className="space-y-2">
            {payments.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                {editPayment && editPayment.id === m.id ? (
                  <div className="flex gap-4 items-center flex-1 flex-wrap">
                    <input 
                      value={editPayment.label} 
                      onChange={e => setEditPayment(ep => ({ ...ep, label: e.target.value }))} 
                      className="border rounded-lg px-3 py-2 w-32" 
                    />
                    <select 
                      value={editPayment.type} 
                      onChange={e => setEditPayment(ep => ({ ...ep, type: e.target.value, value: e.target.value, banks: e.target.value === 'transfer' ? ep.banks : [] }))} 
                      className="border rounded-lg px-3 py-2 w-24"
                    >
                      {paymentTypes.map(pt => (
                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                      ))}
                    </select>
                    {editPayment.type === "transfer" && (
                      <>
                        <div className="flex gap-2">
                          <input 
                            value={bankInput} 
                            onChange={e => setBankInput(e.target.value)} 
                            className="border rounded-lg px-3 py-2 w-28" 
                            placeholder="Банк" 
                          />
                          <button onClick={() => addBankToPayment(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+</button>
                        </div>
                        {editPayment.banks && editPayment.banks.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {editPayment.banks.map(b => (
                              <span key={b} className="bg-gray-200 px-2 py-1 rounded text-sm flex items-center gap-1">
                                {b}
                                <button onClick={() => removeBankFromPayment(b, true)} className="text-red-600 hover:text-red-800">×</button>
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex gap-2">
                      <button onClick={saveEditPayment} className="text-green-600 hover:text-green-700 p-1">✓</button>
                      <button onClick={() => setEditPayment(null)} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="font-medium">{m.label}</span>
                      <span className="text-gray-500 ml-2">({paymentTypes.find(pt => pt.value === m.type)?.label})</span>
                      {m.type === "transfer" && m.banks && m.banks.length > 0 && (
                        <span className="text-blue-600 ml-2">[{m.banks.join(", ")}]</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEditPayment(m)} 
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => askRemovePayment(m.id, m.label)} 
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Справочник: Условия заморозки */}
      {tab === "freeze" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Условия заморозки
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-4 flex-wrap items-center">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  Максимум дней:
                  <input 
                    type="number" 
                    min={1} 
                    value={maxDays} 
                    onChange={e => setMaxDays(Number(e.target.value))} 
                    className="border rounded-lg px-3 py-2 w-20 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input 
                    type="checkbox" 
                    checked={requireConfirm} 
                    onChange={e => setRequireConfirm(e.target.checked)} 
                    className="rounded border-gray-300"
                  />
                  Требуется подтверждение
                </label>
              </div>
              <div className="flex gap-4 items-center">
                <label className="text-sm font-medium text-gray-700">Причины:</label>
                <div className="flex gap-2">
                  <input 
                    value={reasonInput} 
                    onChange={e => setReasonInput(e.target.value)} 
                    className="border rounded-lg px-3 py-2 w-36 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Добавить причину" 
                  />
                  <button onClick={addReason} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">+</button>
                </div>
              </div>
              {reasons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {reasons.map(r => (
                    <span key={r} className="bg-gray-200 px-3 py-1 rounded text-sm flex items-center gap-2">
                      {r}
                      <button onClick={() => removeReason(r)} className="text-red-600 hover:text-red-800">×</button>
                    </span>
                  ))}
                </div>
              )}
              <button 
                onClick={saveFreezeSettings} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium self-start"
              >
                Сохранить
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Эти параметры используются при оформлении заморозки в карточке клиента.
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500 text-center mt-8">
        Все справочники используются в формах клиентов и доступны для редактирования в любой момент.
      </div>

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