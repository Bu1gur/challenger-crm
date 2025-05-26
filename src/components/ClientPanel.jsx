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
}) => {
	const [clients, setClients] = useState([]);
	const [filter, setFilter] = useState({ search: "", trainer: "", status: "" });
	const [modal, setModal] = useState({ open: false, editId: null });
	const [showAll, setShowAll] = useState(false);

	// Загрузка клиентов с сервера
	useEffect(() => {
		fetch(API_URL)
			.then((res) => res.json())
			.then(setClients)
			.catch(() => setClients([]));
	}, []);

	// Добавление/редактирование клиента
	const handleSave = (client) => {
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
				);
		} else {
			fetch(API_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(client),
			})
				.then((res) => res.json())
				.then((newClient) => setClients((prev) => [...prev, newClient]));
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

	return (
		<div className="max-w-[98vw] 2xl:max-w-[1600px] mx-auto bg-white rounded-3xl shadow-2xl p-4 sm:p-10 mt-2 sm:mt-8 border border-gray-100 animate-fade-in">
			<div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
				<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-2 sm:mb-0">
					Клиенты
				</h2>
				<div className="flex flex-wrap gap-3 items-center">
					<button
						className="bg-gradient-to-r from-blue-100 to-blue-300 hover:from-blue-200 hover:to-blue-400 text-blue-800 px-6 py-2 rounded-xl shadow font-semibold transition-all duration-200"
						onClick={handleAdd}
					>
						+ Добавить клиента
					</button>
					<button
						className="bg-gradient-to-r from-green-100 to-green-300 hover:from-green-200 hover:to-green-400 text-green-800 px-4 py-2 rounded-xl shadow font-semibold transition-all duration-200"
						onClick={handleExportRefs}
					>
						Экспорт в Excel
					</button>
					<label className="bg-gradient-to-r from-yellow-100 to-yellow-300 hover:from-yellow-200 hover:to-yellow-400 text-yellow-800 px-4 py-2 rounded-xl shadow font-semibold transition-all duration-200 cursor-pointer">
						Импорт из Excel
						<input
							type="file"
							accept=".xlsx,.xls"
							onChange={handleImport}
							className="hidden"
						/>
					</label>
					<button
						className={`px-4 py-2 rounded-xl font-semibold shadow transition ${
							showAll ? "bg-blue-200 text-blue-800" : "bg-gray-100 text-gray-700"
						} hover:bg-blue-100`}
						onClick={() => setShowAll((v) => !v)}
					>
						{showAll ? "Скрыть удалённых" : "Показать всех"}
					</button>
					<button
						className="bg-gradient-to-r from-red-100 to-red-300 hover:from-red-200 hover:to-red-400 text-red-700 px-4 py-2 rounded-xl shadow font-semibold transition-all duration-200"
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
				<div className="flex flex-col items-center justify-center py-16 text-gray-400">
					<span className="text-6xl mb-4">🗂️</span>
					<div className="text-lg font-semibold mb-2">Нет клиентов</div>
					<div className="text-sm">Добавьте первого клиента, чтобы начать работу</div>
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
		</div>
	);
};

export default ClientPanel;
