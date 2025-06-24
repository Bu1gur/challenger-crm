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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {editMode ? "Редактировать тренера" : "Добавить тренера"}
          </h3>
          <button
            className="text-gray-400 hover:text-gray-600 text-xl"
            onClick={onClose}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        {/* Form */}
        <form className="p-6 space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО<span className="text-red-500">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон<span className="text-red-500">*</span></label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+996XXXXXXXXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Специализация</label>
            <input type="text" name="specialization" value={form.specialization} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Группы</label>
            <div className="space-y-2">
              {groups && groups.filter(g => g.value && g.value !== "none").length === 0 ? (
                <span className="text-gray-400 text-sm">Нет доступных групп</span>
              ) : (
                (groups || [])
                  .filter(g => g.value && g.value !== "none")
                  .map((g) => (
                    <label key={g.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        value={g.value}
                        checked={form.groups && form.groups.includes(g.value)}
                        onChange={handleGroupChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {g.name}
                    </label>
                  ))
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <textarea name="comment" value={form.comment} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows="3" />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {editMode && (
              <button type="button" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors" onClick={() => onDelete && onDelete(form)}>
                Удалить
              </button>
            )}
            <button type="button" className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainerModal;
