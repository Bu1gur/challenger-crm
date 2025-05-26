import React, { useState, useEffect } from "react";

const emptyTrainer = {
  name: "",
  phone: "",
  specialization: "",
  comment: "",
  groups: [],
};

const TrainerModal = ({ trainer, onSave, onDelete, onClose, editMode = false, groups = [] }) => {
  const [form, setForm] = useState(trainer || emptyTrainer);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(trainer ? { ...emptyTrainer, ...trainer } : emptyTrainer);
  }, [trainer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleGroupChange = (e) => {
    const { value, checked } = e.target;
    setForm((f) => ({
      ...f,
      groups: checked ? [...(f.groups || []), value] : (f.groups || []).filter((g) => g !== value),
    }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Имя обязательно";
    if (!form.phone.trim().match(/^[+][0-9]{11,12}$/)) return "Телефон в формате +996XXXXXXXXX или +7XXXXXXXXXX";
    return "";
  };

  const handleSave = () => {
    const err = validate();
    if (err) return setError(err);
    setError("");
    onSave && onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm px-2">
      <div className="bg-white rounded-3xl shadow-xl p-0 w-full max-w-lg relative animate-fade-in overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-blue-50 to-blue-100 text-gray-900">
          <div className="text-2xl font-extrabold">{editMode ? "Редактировать тренера" : "Добавить тренера"}</div>
          <button
            className="text-gray-400 text-3xl font-bold hover:text-blue-400 transition"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        {/* Form */}
        <form className="grid grid-cols-1 gap-5 px-8 py-8 bg-white" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО<span className="text-red-500">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон<span className="text-red-500">*</span></label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+996XXXXXXXXX" className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Специализация</label>
            <input type="text" name="specialization" value={form.specialization} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Группы</label>
            <div className="flex flex-wrap gap-3">
              {groups && groups.filter(g => g.value && g.value !== "none").length === 0 ? (
                <span className="text-gray-400 text-sm">Нет доступных групп</span>
              ) : (
                (groups || [])
                  .filter(g => g.value && g.value !== "none")
                  .map((g) => (
                    <label key={g.value} className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        value={g.value}
                        checked={form.groups && form.groups.includes(g.value)}
                        onChange={handleGroupChange}
                        className="accent-blue-500"
                      />
                      {g.name}
                    </label>
                  ))
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <textarea name="comment" value={form.comment} onChange={handleChange} className="block w-full px-4 py-2 text-gray-800 bg-gray-100 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" rows="2" />
          </div>
          {error && <div className="text-red-500 text-sm font-semibold mt-1">{error}</div>}
          <div className="flex flex-wrap justify-end gap-4 mt-4">
            {editMode && (
              <button type="button" className="bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 text-red-700 px-6 py-2 rounded-xl shadow font-semibold transition-all duration-200" onClick={() => onDelete && onDelete(form)}>
                Удалить
              </button>
            )}
            <button type="submit" className="bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-800 px-6 py-2 rounded-xl shadow font-semibold transition-all duration-200">
              Сохранить
            </button>
            <button type="button" className="bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:bg-blue-300 text-blue-800 px-6 py-2 rounded-xl shadow font-semibold transition-all duration-200" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainerModal;
