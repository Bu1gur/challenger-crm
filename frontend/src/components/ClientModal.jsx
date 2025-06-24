// Компонент модального окна для добавления, редактирования и просмотра клиента
import React, { useState, useEffect, useRef } from "react";
import { isPaid } from "../utils";

// Пустой шаблон клиента (для создания нового)
export const empty = {
  contractNumber: "",
  name: "",
  surname: "",
  phone: "",
  address: "",
  birthDate: "",
  startDate: "",
  subscriptionPeriod: "1m", // value, а не label
  endDate: "",
  paymentAmount: "",
  paymentMethod: "",
  group: "none", // value, а не name
  comment: "",
  status: "Активен",
  paid: false,
  totalSessions: 0,
  freeze: null, // текущая заморозка
  freezeHistory: [], // история заморозок
  visits: [], // журнал посещений
  hasDiscount: false, // скидка
  discountReason: "", // причина скидки (необязательно)
};

// Варианты статусов клиента
const statusOptions = [
  { value: "Активен", label: "Активен" },
  { value: "Заморожен", label: "Заморожен" },
  { value: "Завершён", label: "Завершён" },
];

// Модальное окно для просмотра истории заморозок
const FreezeHistoryModal = ({ freezeHistory, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-xl relative">
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50 text-gray-900 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Журнал заморозок</h3>
        <button
          className="text-gray-400 text-2xl font-bold hover:text-gray-600"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
      <div className="px-6 py-6">
        {freezeHistory && freezeHistory.length > 0 ? (
          <ul className="space-y-3">
            {freezeHistory.map((f, i) => (
              <li key={i} className="flex flex-col gap-1 p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span role="img" aria-label="freeze">❄️</span>
                  <span className="font-medium">{f.start} — {f.end}</span>
                  {f.reason && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">{f.reason}</span>
                  )}
                  {f.confirm && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      Подтверждено
                    </span>
                  )}
                </div>
                {f.comment && <div className="italic text-xs text-gray-400 ml-6">{f.comment}</div>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400 text-sm text-center py-8">Нет истории заморозок</div>
        )}
      </div>
    </div>
  </div>
);

// Основной компонент модального окна клиента
const ClientModal = ({
  client, // объект клиента
  onSave, // функция сохранения
  onClose, // функция закрытия
  periods, // периоды абонементов
  groups, // группы
  payments, // способы оплаты
  editMode = false, // режим редактирования
  extendMode = false, // режим продления
  onExtend, // функция продления
  onEdit, // функция редактирования
  onDelete, // функция удаления
  freezeSettings = {} // настройки заморозки (дефолт)
}) => {
  // Безопасно получаем reasons
  const reasons = Array.isArray(freezeSettings.reasons) ? freezeSettings.reasons : [];

  const [form, setForm] = useState(() => {
    if (client) {
      // Преобразуем snake_case в camelCase
      return {
        ...client,
        contractNumber: client.contract_number || client.contractNumber || "",
        birthDate: client.birth_date || client.birthDate || "",
        startDate: client.start_date || client.startDate || "",
        endDate: client.end_date || client.endDate || "",
        subscriptionPeriod: client.subscription_period || client.subscriptionPeriod || "1m",
        paymentAmount: client.payment_amount || client.paymentAmount || "",
        paymentMethod: client.payment_method || client.paymentMethod || "",
        totalSessions: client.total_sessions || client.totalSessions || 0,
        hasDiscount: client.has_discount || client.hasDiscount || false,
        discountReason: client.discount_reason || client.discountReason || "",
        freezeHistory: client.freeze_history || client.freezeHistory || []
      };
    }
    // Новая запись: дата начала по умолчанию сегодня
    const today = new Date().toISOString().slice(0, 10);
    return { ...empty, startDate: today };
  });

  // Обновляем форму когда клиент изменяется
  useEffect(() => {
    if (client) {
      setForm({
        ...client,
        contractNumber: client.contract_number || client.contractNumber || "",
        birthDate: client.birth_date || client.birthDate || "",
        startDate: client.start_date || client.startDate || "",
        endDate: client.end_date || client.endDate || "",
        subscriptionPeriod: client.subscription_period || client.subscriptionPeriod || "1m",
        paymentAmount: client.payment_amount || client.paymentAmount || "",
        paymentMethod: client.payment_method || client.paymentMethod || "",
        totalSessions: client.total_sessions || client.totalSessions || 0,
        hasDiscount: client.has_discount || client.hasDiscount || false,
        discountReason: client.discount_reason || client.discountReason || "",
        freezeHistory: client.freeze_history || client.freezeHistory || []
      });
      setVisits(client.visits || []);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setForm({ ...empty, startDate: today });
      setVisits([]);
    }
  }, [client]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [freeze, setFreeze] = useState(
    client && client.freeze
      ? { ...client.freeze, isFrozen: client.status === "Заморожен" }
      : { isFrozen: false, freezeStart: "", freezeEnd: "", freezeComment: "", freezeReason: reasons[0] || "", freezeConfirm: false }
  );
  const [visits, setVisits] = useState(client?.visits || []);
  const [showFreezeHistory, setShowFreezeHistory] = useState(false);
  const modalRef = useRef(null);

  // Закрытие по Esc
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Автоматический расчёт даты окончания по months
  useEffect(() => {
    const selected = periods.find(p => p.value === form.subscriptionPeriod);
    if (form.startDate && selected && selected.months) {
      const start = new Date(form.startDate);
      const end = new Date(start);
      end.setMonth(start.getMonth() + Number(selected.months));
      setForm(f => ({ ...f, endDate: end.toISOString().slice(0, 10), totalSessions: selected.trainings || 0 }));
    } else if (!selected) {
      setForm(f => ({ ...f, endDate: "" }));
    }
  }, [form.startDate, form.subscriptionPeriod, periods]);

  // Автоматическая подстановка суммы оплаты
  useEffect(() => {
    const selected = periods.find(p => p.value === form.subscriptionPeriod);
    if (selected && !client) {
      setForm(f => ({ ...f, paymentAmount: selected.price }));
    }
  }, [form.subscriptionPeriod, periods]);

  // При выборе статуса "Заморожен" показываем доп. поля
  const handleStatusChange = (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, status: value }));
    setFreeze((frz) => ({ ...frz, isFrozen: value === "Заморожен" }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFreezeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFreeze((frz) => ({ ...frz, [name]: type === "checkbox" ? checked : value }));
  };

  // Добавить посещение (сегодня)
  const addVisit = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (!visits.includes(today)) {
      setVisits((v) => [...v, today]);
    }
  };
  // Удалить посещение
  const removeVisit = (date) => {
    setVisits((v) => v.filter((d) => d !== date));
  };

  const validateForm = () => {
    // Телефон: +996XXXXXXXXX или +7XXXXXXXXXX, минимум 11-12 символов, только цифры и +
    const phone = form.phone.trim();
    if (!phone.match(/^\+\d{11,12}$/)) {
      return "Введите корректный телефон (+996XXXXXXXXX или +7XXXXXXXXXX)";
    }
    // Имя и фамилия
    if (!form.name.trim() || !form.surname.trim()) {
      return "Имя и фамилия обязательны";
    }
    // Даты: startDate ≤ endDate, birthDate не в будущем
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      return "Дата окончания не может быть раньше даты начала";
    }
    if (form.birthDate && form.birthDate > new Date().toISOString().slice(0, 10)) {
      return "Дата рождения не может быть в будущем";
    }
    // Сумма оплаты: положительное число, не больше стоимости абонемента (если нет скидки)
    const period = periods.find(p => p.value === form.subscriptionPeriod);
    const maxSum = period ? Number(period.price) : 0;
    if (Number(form.paymentAmount) < 0) {
      return "Сумма оплаты не может быть отрицательной";
    }
    if (form.hasDiscount) {
      if (!form.discountReason || !form.discountReason.trim()) {
        return "Укажите причину скидки";
      }
      if (Number(form.paymentAmount) <= 0) {
        return "Сумма оплаты со скидкой должна быть больше 0";
      }
    } else {
      if (maxSum && Number(form.paymentAmount) > maxSum) {
        return `Сумма оплаты не может превышать ${maxSum} сом для выбранного абонемента`;
      }
    }
    // Способ оплаты
    if (!form.paymentMethod) {
      return "Выберите способ оплаты";
    }
    // Валидация заморозки
    if (form.status === "Заморожен") {
      // Даты
      if (!freeze.freezeStart || !freeze.freezeEnd) {
        return "Укажите даты заморозки";
      }
      // Лимит дней
      const start = new Date(freeze.freezeStart);
      const end = new Date(freeze.freezeEnd);
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (diff > freezeSettings.maxDays) {
        return `Максимальный срок заморозки — ${freezeSettings.maxDays} дней`;
      }
      // Причина
      if (freezeSettings.reasons.length && !freeze.freezeReason) {
        return "Укажите причину заморозки";
      }
      // Подтверждение
      if (freezeSettings.requireConfirm && !freeze.freezeConfirm) {
        return "Требуется подтверждение заморозки";
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Предотвращаем множественные отправки
    if (isSubmitting) {
      console.log('[CRM] Already submitting, ignoring duplicate submit');
      return;
    }

    setIsSubmitting(true);
    console.log('[CRM] FORM SUBMIT START', form);
    
    try {
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }
      setError("");
      
      let freezeData = null;
      let freezeHistory = form.freezeHistory ? [...form.freezeHistory] : [];
      
      // Если статус "Заморожен" и есть даты — добавляем в историю, если это новая заморозка
      if (form.status === "Заморожен" && (freeze.freezeStart || freeze.freezeEnd)) {
        freezeData = {
          start: freeze.freezeStart,
          end: freeze.freezeEnd,
          comment: freeze.freezeComment,
          reason: freeze.freezeReason,
          confirm: freeze.freezeConfirm,
        };
        // Добавляем только если это новая заморозка или изменились даты/причина
        const last = freezeHistory[freezeHistory.length - 1];
        if (!last || last.start !== freeze.freezeStart || last.end !== freeze.freezeEnd || last.reason !== freeze.freezeReason) {
          freezeHistory.push(freezeData);
        }
      }
      
      const clientData = { 
        ...form, 
        visits, 
        freeze: freezeData, 
        freezeHistory, 
        trainer: form.trainer || "" 
      };
      
      console.log('[CRM] onSave (ClientModal):', clientData);
      await onSave(clientData);
      
    } catch (error) {
      console.error('[CRM] Submit error:', error);
      setError('Ошибка при сохранении данных');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneFocus = (e) => {
    if (!form.phone) {
      setForm((f) => ({ ...f, phone: "+996" }));
    }
  };

  // Если editMode — показываем старую форму редактирования
  if (editMode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-2 sm:p-6 w-full max-w-2xl relative max-h-[90vh] flex flex-col">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
          <h3 className="text-xl font-bold mb-4 text-gray-800 text-[clamp(1.1rem,2vw,1.4rem)]">Редактировать участника</h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(8px,1vw,18px)] overflow-y-auto pr-2"
            style={{ maxHeight: 'calc(80vh - 60px)' }}
          >
            {error && <div className="md:col-span-2 text-red-500 text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Номер договора</label>
              <input type="text" name="contractNumber" value={form.contractNumber} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="Введите номер договора" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Имя<span className="text-red-500">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия<span className="text-red-500">*</span></label>
              <input type="text" name="surname" value={form.surname} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Телефон<span className="text-red-500">*</span></label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} onFocus={handlePhoneFocus} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required placeholder="Телефон" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="Адрес" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
              <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="ДД.ММ.ГГГГ" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                className="block w-full px-4 py-2 text-gray-400 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Срок абонемента</label>
              <select name="subscriptionPeriod" value={form.subscriptionPeriod} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required>
                {periods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label} — {period.price} сом
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Сумма оплаты</label>
              <input type="number" name="paymentAmount" value={form.paymentAmount} onChange={handleChange} min="0" className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Способ оплаты<span className="text-red-500">*</span></label>
              <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required>
                <option value="">Выберите способ</option>
                {payments.map(payment => (
                  <option key={payment.value} value={payment.value}>
                    {payment.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Группа</label>
              <select name="group" value={form.group} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
                <option value="none">Без группы</option>
                {groups.map(group => (
                  <option key={group.value} value={group.value}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select name="status" value={form.status} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none">
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-center gap-4 mt-2">
              <input type="checkbox" id="hasDiscount" name="hasDiscount" checked={form.hasDiscount} onChange={handleChange} className="mr-2" />
              <label htmlFor="hasDiscount" className="text-sm font-medium text-gray-700 mb-1">Индивидуальная скидка</label>
              {form.hasDiscount && (
                <>
                  <input type="number" name="paymentAmount" value={form.paymentAmount} onChange={handleChange} min="0" placeholder="Сумма со скидкой" className="ml-2 px-2 py-1 w-32 rounded border border-gray-300" />
                  <input type="text" name="discountReason" value={form.discountReason} onChange={handleChange} placeholder="Причина" className="ml-2 px-2 py-1 w-40 rounded border border-gray-300" />
                </>
              )}
            </div>
            <div className="md:col-span-2 mt-2">
              <div className="text-sm font-medium text-gray-700 mb-1">Журнал посещений:</div>
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={addVisit} className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition">+ Сегодня</button>
                <span className="text-green-600 text-xs">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {visits.length > 0 ? (
                  visits.map((date, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                      {date}
                      <button type="button" onClick={() => removeVisit(date)} className="ml-1 text-red-400 hover:text-red-600">×</button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs">Нет посещений</span>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
              <textarea name="comment" value={form.comment} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" rows="3" />
            </div>
            {/* FREEZE FIELDS: показывать только если статус Заморожен */}
            {form.status === "Заморожен" && (
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 rounded-lg p-4 mt-2 border border-blue-100 shadow-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала заморозки</label>
                    <input type="date" name="freezeStart" value={freeze.freezeStart} onChange={handleFreezeChange} className="block w-full px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания заморозки</label>
                    <input type="date" name="freezeEnd" value={freeze.freezeEnd} onChange={handleFreezeChange} className="block w-full px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Причина заморозки</label>
                    <select name="freezeReason" value={freeze.freezeReason} onChange={handleFreezeChange} className="block w-full px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none">
                      <option value="">Выберите причину</option>
                      {freezeSettings.reasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center mt-6">
                    {freezeSettings.requireConfirm && (
                      <>
                        <input type="checkbox" name="freezeConfirm" id="freezeConfirm" checked={freeze.freezeConfirm} onChange={handleFreezeChange} className="mr-2 accent-blue-500" />
                        <label htmlFor="freezeConfirm" className="text-sm">Требуется подтверждение</label>
                      </>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий к заморозке</label>
                    <input type="text" name="freezeComment" value={freeze.freezeComment} onChange={handleFreezeChange} className="block w-full px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                  </div>
                  <div className="md:col-span-2 text-xs text-blue-500 mt-1">Максимальный срок: {freezeSettings.maxDays} дней</div>
                </div>
              </div>
            )}
            <div className="md:col-span-2 flex justify-end gap-3 mt-6">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg shadow font-semibold transition-all duration-200 ${
                  isSubmitting 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isSubmitting ? 'Сохранение...' : 'OK'}
              </button>
              <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow font-semibold transition-all duration-200">Cancel</button>
            </div>
            <div className="md:col-span-2 text-xs text-gray-400 mt-2">* — обязательные поля</div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-2 sm:p-6 w-full max-w-2xl relative max-h-[90vh] flex flex-col">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-4 text-gray-800 text-[clamp(1.1rem,2vw,1.4rem)]">Добавить участника</h3>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(8px,1vw,18px)] overflow-y-auto pr-2"
          style={{ maxHeight: 'calc(80vh - 60px)' }}
        >
          {error && <div className="md:col-span-2 text-red-500 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Номер договора</label>
            <input type="text" name="contractNumber" value={form.contractNumber} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="Введите номер договора" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя<span className="text-red-500">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия<span className="text-red-500">*</span></label>
            <input type="text" name="surname" value={form.surname} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон<span className="text-red-500">*</span></label>
            <input type="text" name="phone" value={form.phone} onChange={handleChange} onFocus={handlePhoneFocus} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
            <input type="text" name="address" value={form.address} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="Адрес" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения</label>
            <input type="date" name="birthDate" value={form.birthDate} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="ДД.ММ.ГГГГ" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
            <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
            <input type="date" name="endDate" value={form.endDate} className="block w-full px-4 py-2 text-gray-400 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Срок абонемента</label>
            <select
              name="subscriptionPeriod"
              value={form.subscriptionPeriod}
              onChange={handleChange}
              className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            >
              {periods.map(period => (
                <option key={period.value} value={period.value}>
                  {period.label} — {period.price} сом
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Сумма оплаты</label>
            <input
              type="number"
              name="paymentAmount"
              value={form.paymentAmount}
              onChange={handleChange}
              min="0"
              className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Способ оплаты<span className="text-red-500">*</span></label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              required
            >
              <option value="">Выберите способ</option>
              {payments.map(payment => (
                <option key={payment.value} value={payment.value}>
                  {payment.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Группа</label>
            <select
              name="group"
              value={form.group}
              onChange={handleChange}
              className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              <option value="none">Без группы</option>
              {groups.map(group => (
                <option key={group.value} value={group.value}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex items-center gap-4 mt-2">
            <input
              type="checkbox"
              id="hasDiscount"
              name="hasDiscount"
              checked={form.hasDiscount}
              onChange={handleChange}
              className="mr-2"
            />
            <label
              htmlFor="hasDiscount"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Индивидуальная скидка
            </label>
            {form.hasDiscount && (
              <>
                <input
                  type="number"
                  name="paymentAmount"
                  value={form.paymentAmount}
                  onChange={handleChange}
                  min="0"
                  placeholder="Сумма со скидкой"
                  className="ml-2 px-2 py-1 w-32 rounded border border-gray-300"
                />
                <input
                  type="text"
                  name="discountReason"
                  value={form.discountReason}
                  onChange={handleChange}
                  placeholder="Причина"
                  className="ml-2 px-2 py-1 w-40 rounded border border-gray-300"
                />
              </>
            )}
          </div>
          <div className="md:col-span-2 mt-2">
            <div className="text-sm font-medium text-gray-700 mb-1">Журнал посещений:</div>
            <div className="flex items-center gap-2 mb-2">
              <button type="button" onClick={addVisit} className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition">+ Сегодня</button>
              <span className="text-green-600 text-xs">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {visits.length > 0 ? (
                visits.map((date, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                    {date}
                    <button type="button" onClick={() => removeVisit(date)} className="ml-1 text-red-400 hover:text-red-600">×</button>
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs">Нет посещений</span>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <textarea name="comment" value={form.comment} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" rows="3" />
          </div>
          {/* FREEZE FIELDS: показывать только если статус Заморожен */}
          {form.status === "Заморожен" && (
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 rounded-lg p-4 mt-2 border border-blue-100 shadow-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала заморозки</label>
                  <input type="date" name="freezeStart" value={freeze.freezeStart} onChange={handleFreezeChange} className="block w-full px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания заморозки</label>
                  <input type="date" name="freezeEnd" value={freeze.freezeEnd} onChange={handleFreezeChange} className="block w-full px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Причина заморозки</label>
                  <select name="freezeReason" value={freeze.freezeReason} onChange={handleFreezeChange} className="block w-full px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none">
                    <option value="">Выберите причину</option>
                    {freezeSettings.reasons.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex items-center mt-6">
                  {freezeSettings.requireConfirm && (
                    <>
                      <input type="checkbox" name="freezeConfirm" id="freezeConfirm" checked={freeze.freezeConfirm} onChange={handleFreezeChange} className="mr-2 accent-blue-500" />
                      <label htmlFor="freezeConfirm" className="text-sm">Требуется подтверждение</label>
                    </>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий к заморозке</label>
                  <input type="text" name="freezeComment" value={freeze.freezeComment} onChange={handleFreezeChange} className="block w-full px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                </div>
                <div className="md:col-span-2 text-xs text-blue-500 mt-1">Максимальный срок: {freezeSettings.maxDays} дней</div>
              </div>
            </div>
          )}
          <div className="md:col-span-2 flex justify-end gap-3 mt-6">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg shadow font-semibold transition-all duration-200 ${
                isSubmitting 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isSubmitting ? 'Сохранение...' : 'OK'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg shadow font-semibold transition-all duration-200">Cancel</button>
          </div>
          <div className="md:col-span-2 text-xs text-gray-400 mt-2">* — обязательные поля</div>
        </form>
      </div>
    </div>
  );

  // История заморозки Modal
  if (showFreezeHistory) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-0 w-full max-w-2xl relative overflow-hidden border border-gray-100">
          <div className="flex items-center justify-between px-8 py-6 bg-gray-50 text-gray-900">
            <div>
              <div className="text-2xl font-extrabold mb-1 flex items-center gap-3">
                <span className="inline-block bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-lg font-bold mr-2">
                  {client?.surname} {client?.name}
                </span>
                {client?.hasDiscount && (
                  <span className="inline-block bg-yellow-50 text-yellow-700 rounded px-2 py-1 text-xs font-semibold ml-2">
                    Скидка
                  </span>
                )}
              </div>
              <div className="flex gap-4 items-center text-sm">
                <span
                  className={`inline-block px-3 py-1 rounded-lg font-semibold ${
                    client?.status === "Активен"
                      ? "bg-green-50 text-green-700"
                      : client?.status === "Заморожен"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {client?.status}
                </span>
                <span className="inline-block px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 font-semibold">
                  {client?.phone}
                </span>
                {client?.group && (
                  <span className="inline-block px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 font-semibold">
                    Группа: {groups.find(g => g.value === client.group)?.name || "—"}
                  </span>
                )}
              </div>
            </div>
            <button
              className="text-gray-400 text-3xl font-bold hover:text-blue-400 transition"
              onClick={onClose}
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
          {/* Основная информация карточки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-8 bg-white">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Абонемент</div>
                <div className="text-lg font-semibold text-gray-800">
                  {periods.find(p => p.value === client?.subscriptionPeriod)?.label || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Срок действия</div>
                <div className="text-base text-gray-700">
                  {client?.startDate} — {client?.endDate}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Оплата</div>
                <div className="flex gap-2 items-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-lg font-semibold ${
                      isPaid(client, periods)
                        ? "bg-blue-50 text-blue-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {isPaid(client, periods) ? "Оплачено" : "Не оплачено"}
                  </span>
                  <span className="text-gray-700">{client?.paymentAmount} сом</span>
                  <span className="text-xs text-gray-400">
                    ({payments.find(p => p.value === client?.paymentMethod)?.label ||
                      "—"})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Осталось тренировок</div>
                <div className="text-lg font-bold text-blue-700">
                  {(() => {
                    const period = periods.find(p => p.value === client?.subscriptionPeriod);
                    if (period && typeof period.trainings === 'number' && Array.isArray(client?.visits)) {
                      return period.trainings - client.visits.length;
                    }
                    if (typeof client?.totalSessions === 'number' && Array.isArray(client?.visits)) {
                      return client.totalSessions - client.visits.length;
                    }
                    return '—';
                  })()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Посещений</div>
                <div className="text-lg font-bold text-gray-700">
                  {Array.isArray(client?.visits) ? client.visits.length : 0}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                  Заморозка
                  {client?.freezeHistory && client.freezeHistory.length > 0 && (
                    <button
                      type="button"
                      className="text-xs text-blue-500 underline hover:text-blue-700 ml-2"
                      onClick={() => setShowFreezeHistory(true)}
                    >
                      Журнал заморозок
                    </button>
                  )}
                </div>
                {client?.status === "Заморожен" && client?.freeze && (client.freeze.start || client.freeze.end) ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 text-blue-700 text-sm border border-blue-100">
                    <span role="img" aria-label="freeze">❄️</span>
                    {client.freeze.start} - {client.freeze.end}
                    {client.freeze.reason && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">{client.freeze.reason}</span>
                    )}
                    {client.freeze.confirm && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        Подтверждено
                      </span>
                    )}
                    {client.freeze.comment && (
                      <span className="italic text-gray-400 ml-2">({client.freeze.comment})</span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Комментарии</div>
                <div className="text-gray-700 min-h-[32px]">
                  {client?.comment || <span className="text-gray-300">—</span>}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Адрес</div>
                <div className="text-gray-700 min-h-[32px]">{client?.address || <span className="text-gray-300">—</span>}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Дата рождения</div>
                <div className="text-gray-700 min-h-[32px]">{client?.birthDate || <span className="text-gray-300">—</span>}</div>
              </div>
            </div>
          </div>
          {/* Кнопки действий */}
          <div className="flex flex-wrap justify-end gap-4 px-8 py-6 bg-gray-50 border-t border-gray-100">
            <button
              className="bg-green-100 hover:bg-green-200 text-green-800 px-6 py-2 rounded-lg shadow font-semibold transition-all duration-200"
              onClick={() => onExtend && onExtend(client.id)}
            >
              Продлить
            </button>
            <button
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-6 py-2 rounded-lg shadow font-semibold transition-all duration-200"
              onClick={() => onEdit && onEdit(client.id)}
            >
              Редактировать
            </button>
            <button
              className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-lg shadow font-semibold transition-all duration-200"
              onClick={() => onDelete && onDelete(client.id)}
            >
              Удалить
            </button>
            <button
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-2 rounded-lg shadow font-semibold transition-all duration-200"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
          {showFreezeHistory && (
            <FreezeHistoryModal freezeHistory={client.freezeHistory} onClose={() => setShowFreezeHistory(false)} />
          )}
        </div>
      </div>
    );
  }

  // Карточка просмотра клиента (когда не в режиме редактирования или продления)
  if (client && !editMode && !(typeof extendMode !== 'undefined' && extendMode)) {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm px-2">
        <div className="bg-white rounded-lg shadow-lg p-0 w-full max-w-2xl relative overflow-hidden border border-gray-100">
          {/* Верхняя панель с ФИО, статусом, быстрыми действиями */}
          <div className="flex items-center justify-between px-8 py-6 bg-gray-50 text-gray-900">
            <div>
              <div className="text-2xl font-extrabold mb-1 flex items-center gap-3">
                <span className="inline-block bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-lg font-bold mr-2">
                  {client?.surname} {client?.name}
                </span>
                {client?.hasDiscount && (
                  <span className="inline-block bg-yellow-50 text-yellow-700 rounded px-2 py-1 text-xs font-semibold ml-2">
                    Скидка
                  </span>
                )}
              </div>
              <div className="flex gap-4 items-center text-sm">
                <span
                  className={`inline-block px-3 py-1 rounded-lg font-semibold ${
                    client?.status === "Активен"
                      ? "bg-green-50 text-green-700"
                      : client?.status === "Заморожен"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {client?.status}
                </span>
                <span className="inline-block px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 font-semibold">
                  {client?.phone}
                </span>
                {client?.group && (
                  <span className="inline-block px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 font-semibold">
                    Группа: {groups.find(g => g.value === client.group)?.name || "—"}
                  </span>
                )}
              </div>
            </div>
            <button
              className="text-gray-400 text-3xl font-bold hover:text-blue-400 transition"
              onClick={onClose}
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
          {/* Основная информация карточки */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-8 bg-white">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 mb-1">Абонемент</div>
                <div className="text-lg font-semibold text-gray-800">
                  {periods.find(p => p.value === client?.subscriptionPeriod)?.label || "—"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Срок действия</div>
                <div className="text-base text-gray-700">
                  {client?.startDate} — {client?.endDate}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Оплата</div>
                <div className="flex gap-2 items-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-lg font-semibold ${
                      isPaid(client, periods)
                        ? "bg-blue-50 text-blue-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {isPaid(client, periods) ? "Оплачено" : "Не оплачено"}
                  </span>
                  <span className="text-gray-700">{client?.paymentAmount} сом</span>
                  <span className="text-xs text-gray-400">
                    ({payments.find(p => p.value === client?.paymentMethod)?.label ||
                      "—"})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Осталось тренировок</div>
                <div className="text-lg font-bold text-blue-700">
                  {(() => {
                    const period = periods.find(p => p.value === client?.subscriptionPeriod);
                    if (period && typeof period.trainings === 'number' && Array.isArray(client?.visits)) {
                      return period.trainings - client.visits.length;
                    }
                    if (typeof client?.totalSessions === 'number' && Array.isArray(client?.visits)) {
                      return client.totalSessions - client.visits.length;
                    }
                    return '—';
                  })()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Посещений</div>
                <div className="text-lg font-bold text-gray-700">
                  {Array.isArray(client?.visits) ? client.visits.length : 0}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                  Заморозка
                  {client?.freezeHistory && client.freezeHistory.length > 0 && (
                    <button
                      type="button"
                      className="text-xs text-blue-500 underline hover:text-blue-700 ml-2"
                      onClick={() => setShowFreezeHistory(true)}
                    >
                      Журнал заморозок
                    </button>
                  )}
                </div>
                {client?.status === "Заморожен" && client?.freeze && (client.freeze.start || client.freeze.end) ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-50 text-blue-700 text-sm border border-blue-100">
                    <span role="img" aria-label="freeze">❄️</span>
                    {client.freeze.start} - {client.freeze.end}
                    {client.freeze.reason && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">{client.freeze.reason}</span>
                    )}
                    {client.freeze.confirm && (
                      <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium flex items-center gap-1">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        Подтверждено
                      </span>
                    )}
                    {client.freeze.comment && (
                      <span className="italic text-gray-400 ml-2">({client.freeze.comment})</span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Комментарии</div>
                <div className="text-gray-700 min-h-[32px]">
                  {client?.comment || <span className="text-gray-300">—</span>}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Адрес</div>
                <div className="text-gray-700 min-h-[32px]">{client?.address || <span className="text-gray-300">—</span>}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Дата рождения</div>
                <div className="text-gray-700 min-h-[32px]">{client?.birthDate || <span className="text-gray-300">—</span>}</div>
              </div>
            </div>
          </div>
          {/* Кнопки действий */}
          <div className="flex flex-wrap justify-end gap-4 px-8 py-6 bg-gray-50 border-t border-gray-100">
            <button
              className="bg-green-100 hover:bg-green-200 text-green-800 px-6 py-2 rounded-lg shadow font-semibold transition-all duration-200"
              onClick={() => onExtend && onExtend(client.id)}
            >
              Продлить
            </button>
            <button
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-6 py-2 rounded-lg shadow font-semibold transition-all duration-200"
              onClick={() => onEdit && onEdit(client.id)}
            >
              Редактировать
            </button>
            <button
              className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-lg shadow font-semibold transition-all duration-200"
              onClick={() => onDelete && onDelete(client.id)}
            >
              Удалить
            </button>
            <button
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-2 rounded-lg shadow font-semibold transition-all duration-200"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
          {showFreezeHistory && (
            <FreezeHistoryModal freezeHistory={client.freezeHistory} onClose={() => setShowFreezeHistory(false)} />
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ClientModal;
