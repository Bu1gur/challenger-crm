import React, { useState, useEffect } from "react";
import Filters from "./Filters";
import Table from "./Table";
import ClientModal, { empty } from "./ClientModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { API_ENDPOINTS } from "../config/api";

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
		fetch(API_ENDPOINTS.CLIENTS)
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
	const handleSave = async (client) => {
		console.log("[CRM] handleSave вызван с клиентом:", client);
		setLoading(true);
		setError(null);
		
		try {
			// Преобразуем camelCase в snake_case для API и убираем лишние поля
			const apiClient = {
				contract_number: client.contractNumber || "",
				name: client.name || "",
				surname: client.surname || "",
				phone: client.phone || "",
				address: client.address || "",
				birth_date: client.birthDate || "",
				start_date: client.startDate || "",
				end_date: client.endDate || "",
				subscription_period: client.subscriptionPeriod || "",
				payment_amount: client.paymentAmount || "",
				payment_method: client.paymentMethod || "",
				group: client.group || "",
				comment: client.comment || "",
				status: client.status || "Активен",
				paid: client.paid || false,
				total_sessions: client.totalSessions || 0,
				has_discount: client.hasDiscount || false,
				discount_reason: client.discountReason || "",
				trainer: client.trainer || ""
			};
			
			// Если редактируем, добавляем ID
			if (client.id) {
				apiClient.id = client.id;
			}
			
			console.log("[CRM] Отправляем на API:", apiClient);
			console.log("[CRM] Сравнение полей:");
			console.log("client.contractNumber:", client.contractNumber, "-> contract_number:", apiClient.contract_number);
			console.log("client.birthDate:", client.birthDate, "-> birth_date:", apiClient.birth_date);
			console.log("client.startDate:", client.startDate, "-> start_date:", apiClient.start_date);
			
			let response;
			if (client.id) {
				// Редактирование существующего клиента
				response = await fetch(`${API_ENDPOINTS.CLIENTS}/${client.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(apiClient),
				});
				
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
				
				const updated = await response.json();
				console.log("[CRM] Клиент обновлен:", updated);
				setClients((prev) =>
					prev.map((c) => (c.id === updated.id ? updated : c))
				);
				setModal({ open: false, editId: null, forceEdit: false });
			} else {
				// Добавление нового клиента
				console.log("[CRM] Добавляем нового клиента:", apiClient);
				response = await fetch(API_ENDPOINTS.CLIENTS, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(apiClient),
				});
				
				console.log("[CRM] Ответ сервера на POST:", response.status, response.statusText);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}
				
				const newClient = await response.json();
				console.log("[CRM] Новый клиент создан:", newClient);
				setClients((prev) => [...prev, newClient]);
				setModal({ open: false, editId: null });
			}
		} catch (error) {
			console.error("[CRM] Ошибка сохранения клиента:", error);
			setError(error.message);
			throw error; // Пробрасываем ошибку для ClientModal
		} finally {
			setLoading(false);
		}
	};

	// Мягкое удаление клиента (оставляет в базе)
	const handleDelete = (id) => {
		if (window.confirm("Удалить этого клиента? Это действие необратимо.")) {
			fetch(`${API_ENDPOINTS.CLIENTS}/${id}`, { method: "DELETE" })
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
	const handleView = (id) => setModal({ open: true, editId: id }); // Просмотр карточки
	const handleEdit = (id) => setModal({ open: true, editId: id, forceEdit: true }); // Прямое редактирование

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
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h2 className="text-2xl font-bold text-gray-900">
					Клиенты
				</h2>
				<div className="flex flex-wrap gap-3 items-center">
					<button
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
						onClick={handleAdd}
					>
						+ Добавить клиента
					</button>
					<button
						className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
						onClick={handleExportRefs}
					>
						Экспорт в Excel
					</button>
					<label className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer">
						Импорт из Excel
						<input
							type="file"
							accept=".xlsx,.xls"
							onChange={handleImport}
							className="hidden"
						/>
					</label>
					<button
						className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
							showAll 
								? "bg-blue-100 text-blue-800" 
								: "bg-gray-100 text-gray-700 hover:bg-gray-200"
						}`}
						onClick={() => setShowAll((v) => !v)}
					>
						{showAll ? "Скрыть удалённых" : "Показать всех"}
					</button>
					<button
						className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
						onClick={handleReset}
					>
						Сбросить базу
					</button>
				</div>
			</div>
			<Filters filter={filter} setFilter={setFilter} clients={clients} />
			<Table
				clients={filtered}
				onView={handleView}
				onEdit={handleEdit}
				onDelete={handleDelete}
				periods={periods}
				groups={groups}
				onExtend={handleExtend}
			/>
			{filtered.length === 0 && (
				<div className="flex flex-col items-center justify-center py-12 text-gray-500">
					<span className="text-4xl mb-4">📋</span>
					<div className="text-xl font-medium mb-2">Нет клиентов</div>
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
