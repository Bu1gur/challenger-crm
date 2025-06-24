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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
        <div className="text-lg font-medium mb-4 text-center">{text}</div>
        <div className="flex justify-center gap-3">
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
  );
}

const AdminPanel = ({
  periods, setPeriods,
  groups, setGroups,
  payments, setPayments,
  freezeSettings, setFreezeSettings
}) => {
  const [tab, setTab] = useState("periods");

  // CRUD для справочников через сервер
  useEffect(() => {
    fetch(API_ENDPOINTS.PERIODS).then(res => res.json()).then(setPeriods).catch(() => setPeriods([]));
    fetch(API_ENDPOINTS.GROUPS).then(res => res.json()).then(setGroups).catch(() => setGroups([]));
    fetch(API_ENDPOINTS.PAYMENTS).then(res => res.json()).then(setPayments).catch(() => setPayments([]));
    fetch(API_ENDPOINTS.FREEZE_SETTINGS).then(res => res.json()).then(arr => setFreezeSettings(arr[0] || {})).catch(() => setFreezeSettings({}));
  }, [setPeriods, setGroups, setPayments, setFreezeSettings]);

  // Состояния для периодов
  const [newPeriod, setNewPeriod] = useState({ label: "", months: 1, price: "", trainings: "" });
  const [editPeriod, setEditPeriod] = useState(null);
  const [periodErrors, setPeriodErrors] = useState({});

  const validatePeriod = (period) => {
    const errors = {};
    if (!period.label) errors.label = "Название обязательно";
    if (!period.months || period.months < 1) errors.months = "Мин. 1 месяц";
    if (!period.price || period.price < 1) errors.price = "Укажите цену";
    if (!period.trainings || period.trainings < 1) errors.trainings = "Мин. 1 тренировка";
    return errors;
  };

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

  // Модалка подтверждения удаления
  const [confirm, setConfirm] = useState({ open: false, type: null, value: null, id: null });
  const askRemovePeriod = (id, label) => setConfirm({ open: true, type: "period", value: label, id });

  const handleConfirmDelete = () => {
    if (confirm.type === "period") deletePeriod(confirm.id);
    setConfirm({ open: false, type: null, value: null, id: null });
  };

  // Экспорт/импорт справочников
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
        const freezeData = XLSX.utils.sheet_to_json(freezeSheet);
        if (freezeData.length > 0) setFreezeSettings(freezeData[0]);
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            onClick={handleExportRefs}
          >
            Экспорт справочников
          </button>
          <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer">
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
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
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
          
          {/* Форма добавления */}
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
                  className={`border rounded-md px-3 py-2 w-40 ${periodErrors.label ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
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
                  className={`border rounded-md px-3 py-2 w-20 ${periodErrors.months ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
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
                  className={`border rounded-md px-3 py-2 w-28 ${periodErrors.price ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
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
                  className={`border rounded-md px-3 py-2 w-28 ${periodErrors.trainings ? "border-red-300" : "border-gray-300"} focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                  type="number" 
                  min={1} 
                />
                {periodErrors.trainings && <span className="text-red-500 text-xs mt-1">{periodErrors.trainings}</span>}
              </div>
              <button
                onClick={addPeriod}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
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
                      className="border rounded px-2 py-1 w-32" 
                    />
                    <input 
                      value={editPeriod.months} 
                      onChange={e => setEditPeriod(ep => ({ ...ep, months: e.target.value }))} 
                      className="border rounded px-2 py-1 w-16" 
                      type="number" 
                    />
                    <input 
                      value={editPeriod.price} 
                      onChange={e => setEditPeriod(ep => ({ ...ep, price: e.target.value }))} 
                      className="border rounded px-2 py-1 w-20" 
                      type="number" 
                    />
                    <input 
                      value={editPeriod.trainings} 
                      onChange={e => setEditPeriod(ep => ({ ...ep, trainings: e.target.value }))} 
                      className="border rounded px-2 py-1 w-20" 
                      type="number" 
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEditPeriod} className="text-green-600 hover:text-green-700">✓</button>
                      <button onClick={() => setEditPeriod(null)} className="text-gray-400 hover:text-gray-600">✕</button>
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

      {/* Остальные табы - пока заглушки */}
      {tab === "groups" && (
        <div className="text-center py-8 text-gray-500">
          Раздел "Группы" будет доступен в следующей версии
        </div>
      )}

      {tab === "payments" && (
        <div className="text-center py-8 text-gray-500">
          Раздел "Способы оплаты" будет доступен в следующей версии
        </div>
      )}

      {tab === "freeze" && (
        <div className="text-center py-8 text-gray-500">
          Раздел "Условия заморозки" будет доступен в следующей версии
        </div>
      )}

      <ConfirmModal
        open={confirm.open}
        text={`Вы уверены, что хотите удалить "${confirm.value}"?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirm({ open: false, type: null, value: null, id: null })}
      />
    </div>
  );
};

export default AdminPanel;
