import React, { useState, useEffect } from "react";
import Filters from "./Filters";
import Table from "./Table";
import ClientModal, { empty } from "./ClientModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_URL = "https://challenger-crm.onrender.com/clients";

const ClientPanel = ({
	periods = [],
	groups = [],
	payments = [],
	freezeSettings,
	setPeriods,
	setGroups,
	setPayments,
	setFreezeSettings,
	clients,
	setClients,
}) => {
	const [filter, setFilter] = useState({ search: "", trainer: "", status: "" });
	const [modal, setModal] = useState({ open: false, editId: null });
	const [showAll, setShowAll] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Загрузка клиентов с сервера
	const fetchClients = () => {
		setLoading(true);
		setError(null);
		fetch(API_URL)
			.then((res) => {
				if (!res.ok) throw new Error(res.statusText);
				return res.json();
			})
			.then(setClients)
			.catch((e) => {
				setClients([]);
				setError(e.message);
				console.error("Ошибка загрузки клиентов:", e);
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		fetchClients();
	}, []);

	// Добавление/редактирование клиента
	const handleSave = (client) => {
		setLoading(true);
		setError(null);
		if (client.id) {
			fetch(`${API_URL}/${client.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(client),
			})
				.then((res) => res.json())
				.then((updated) =>
					setClients((prev) =>
						prev.map((c) => (c.id === updated.id ? updated : c))
					)
				)
				.catch((e) => {
					setError(e.message);
					console.error("Ошибка обновления клиента:", e);
				})
				.finally(() => setLoading(false));
		} else {
			fetch(API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(client),
			})
				.then((res) => {
					if (!res.ok) throw new Error(res.statusText);
					return res.json();
				})
				.then(() => fetchClients())
				.catch((e) => {
					setError(e.message);
					console.error("Ошибка добавления клиента:", e);
				})
				.finally(() => setLoading(false));
		}
		setModal({ open: false, editId: null });
	};

	// Мягкое удаление клиента (оставляет в базе)
	const handleDelete = (id) => {
		if (window.confirm("Удалить этого клиента? Это действие необратимо.")) {
			fetch(`${API_URL}/${id}`, { method: "DELETE" })
				.then(() => setClients((prev) => prev.filter((c) => c.id !== id)));
		}
	};

	// Продление клиента на следующий месяц (пример, можно доработать)
	const handleExtend = (id) => {
		// Здесь можно реализовать продление через API, если нужно
	};

	// Фильтрация
	const filtered = (clients || []).filter((c) => {
		if (!showAll && c.deleted) return false;
		if (
			filter.search &&
			!(`${c.name} ${c.surname} ${c.phone}`.toLowerCase().includes(filter.search.toLowerCase()))
		)
			return false;
		if (filter.trainer && c.trainer !== filter.trainer) return false;
		if (filter.status && c.status !== filter.status) return false;
		return true;
	});

	// Экспорт/импорт и прочее оставляю как есть (работают только с текущим clients)

	const handleAdd = () => setModal({ open: true, editId: null });
	const handleEdit = (id) => setModal({ open: true, editId: id });

	const editingClient = clients.find((c) => c.id === modal.editId) || null;

	// Экспорт клиентов в Excel
	const handleExportRefs = () => {
		const wb = XLSX.utils.book_new();
		wb.Props = { Title: "Клиенты CRM" };
		XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clients), "Клиенты");
		const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
		saveAs(new Blob([wbout], { type: "application/octet-stream" }), `clients_${new Date().toISOString().slice(0,10)}.xlsx`);
	};

	// Импорт клиентов из Excel
	const handleImport = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (evt) => {
			const data = new Uint8Array(evt.target.result);
			const workbook = XLSX.read(data, { type: "array" });
			const sheet = workbook.Sheets[workbook.SheetNames[0]];
			const importedClients = XLSX.utils.sheet_to_json(sheet);
			setClients(importedClients);
		};
		reader.readAsArrayBuffer(file);
	};

	// Проверка режима редактирования
	const isEditMode = modal.forceEdit || false;
	const handleForceEdit = (id) => setModal({ open: true, editId: id, forceEdit: true });
	const handleExtendModal = (id) => setModal({ open: true, editId: id, extend: true });
	const handleReset = () => {
		if (window.confirm("Сбросить базу клиентов?")) setClients([]);
	};

	return (
		<div
			className="max-w-[96vw] 2xl:max-w-[1300px] mx-auto bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-3xl shadow-3xl border border-gray-100 animate-fade-in min-h-[80vh] px-[clamp(8px,2vw,24px)] py-[clamp(8px,2vw,24px)] mt-[clamp(4px,1vw,20px)]"
		>
			<div className="flex flex-col sm:flex-row justify-between items-center mb-[clamp(10px,2vw,24px)] gap-[clamp(6px,1vw,18px)]">
				<h2 className="font-black tracking-tight text-gray-900 mb-2 sm:mb-0 drop-shadow-lg text-[clamp(1.5rem,2vw,2.2rem)] leading-tight">
					Клиенты
				</h2>
				<div className="flex flex-wrap gap-[clamp(6px,0.8vw,16px)] items-center justify-end w-full sm:w-auto">
					<button
						className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white px-[clamp(12px,1.2vw,24px)] py-[clamp(8px,0.9vw,16px)] rounded-2xl shadow-xl font-bold text-[clamp(0.95rem,1vw,1.2rem)] transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-300"
						onClick={handleAdd}
					>
						+ Добавить клиента
					</button>
					<button
						className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-[clamp(10px,1vw,20px)] py-[clamp(8px,0.9vw,16px)] rounded-2xl shadow-xl font-bold text-[clamp(0.95rem,1vw,1.2rem)] transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-300"
						onClick={handleExportRefs}
					>
						Экспорт в Excel
					</button>
					<label className="bg-gradient-to-r from-yellow-300 to-orange-400 hover:from-yellow-400 hover:to-orange-500 text-white px-[clamp(10px,1vw,20px)] py-[clamp(8px,0.9vw,16px)] rounded-2xl shadow-xl font-bold text-[clamp(0.95rem,1vw,1.2rem)] transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-300 flex items-center">
						Импорт из Excel
						<input
							type="file"
							accept=".xlsx,.xls"
							onChange={handleImport}
							className="hidden"
						/>
					</label>
					<button
						className={`px-[clamp(10px,1vw,20px)] py-[clamp(8px,0.9vw,16px)] rounded-2xl font-bold text-[clamp(0.95rem,1vw,1.2rem)] shadow-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-200 ${showAll ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700 hover:bg-blue-50"}`}
						onClick={() => setShowAll((v) => !v)}
					>
						{showAll ? "Скрыть удалённых" : "Показать всех"}
					</button>
					<button
						className="bg-gradient-to-r from-red-300 to-pink-400 hover:from-red-400 hover:to-pink-500 text-white px-[clamp(10px,1vw,20px)] py-[clamp(8px,0.9vw,16px)] rounded-2xl shadow-xl font-bold text-[clamp(0.95rem,1vw,1.2rem)] transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-200"
						onClick={handleReset}
					>
						Сбросить базу
					</button>
				</div>
			</div>
			<Filters filter={filter} setFilter={setFilter} clients={clients} />
			<Table
				clients={filtered}
				onEdit={handleEdit}
				onDelete={handleDelete}
				periods={periods}
				groups={groups}
				onExtend={handleExtend}
			/>
			{filtered.length === 0 && (
				<div className="flex flex-col items-center justify-center py-24 text-gray-400 animate-fade-in">
					<span className="text-7xl mb-6">🗂️</span>
					<div className="text-2xl font-bold mb-2">Нет клиентов</div>
					<div className="text-base">Добавьте первого клиента, чтобы начать работу</div>
				</div>
			)}
			{modal.open && !isEditMode && !modal.extend && (
				<ClientModal
					client={editingClient}
					onSave={handleSave}
					onClose={() => setModal({ open: false, editId: null })}
					periods={periods}
					groups={groups}
					payments={payments}
					freezeSettings={freezeSettings}
					onEdit={handleForceEdit}
					onExtend={handleExtendModal}
					onDelete={handleDelete}
				/>
			)}
			{modal.open && isEditMode && (
				<ClientModal
					client={editingClient}
					onSave={handleSave}
					onClose={() => setModal({ open: false, editId: null, forceEdit: false })}
					periods={periods}
					groups={groups}
					payments={payments}
					freezeSettings={freezeSettings}
					editMode={true}
					onEdit={handleEdit}
					onExtend={handleExtendModal}
					onDelete={handleDelete}
				/>
			)}
			{modal.open && modal.extend && (
				<ClientModal
					client={editingClient}
					onSave={handleSave}
					onClose={() => setModal({ open: false, editId: null, extend: false })}
					periods={periods}
					groups={groups}
					payments={payments}
					freezeSettings={freezeSettings}
					extendMode={true}
					onEdit={handleEdit}
					onExtend={handleExtendModal}
					onDelete={handleDelete}
				/>
			)}
			{loading && (
				<div className="text-center text-blue-400 font-bold py-4 animate-pulse">Загрузка...</div>
			)}
			{error && (
				<div className="text-center text-red-500 font-bold py-2">Ошибка: {error}</div>
			)}
		</div>
	);
};

export default ClientPanel;
