import React, { useState } from "react";
import Filters from "./Filters";
import Table from "./Table";
import ClientModal, { empty } from "./ClientModal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// MVP-данные клиентов (useState)
const initialClients = [
	{
		id: 1,
		name: "Иван Иванов",
		surname: "Иванов",
		phone: "+7 900 123-45-67",
		subscription: "12 занятий",
		trainer: "Петров",
		status: "Активен",
		paid: true,
		totalSessions: 12,
		attended: 5,
		freeze: null,
		freezeHistory: [],
		visits: [],
		subscriptionPeriod: "1m",
		group: "none",
		paymentAmount: 4000,
		paymentMethod: "Наличные",
		hasDiscount: false,
	},
	{
		id: 2,
		name: "Мария Смирнова",
		surname: "Смирнова",
		phone: "+7 900 765-43-21",
		subscription: "8 занятий",
		trainer: "Сидоров",
		status: "Заморожен",
		paid: false,
		totalSessions: 8,
		attended: 2,
		freeze: null,
		freezeHistory: [],
		visits: [],
		subscriptionPeriod: "3m",
		group: "g1",
		paymentAmount: 12000,
		paymentMethod: "Карта",
		hasDiscount: false,
	},
];

const ClientPanel = ({
	periods = [],
	groups = [],
	payments = [],
	freezeSettings,
	setPeriods,
	setGroups,
	setPayments,
	setFreezeSettings,
	clients: externalClients,
	setClients: setExternalClients,
}) => {
	const [clients, setClientsInternal] = useState(() => {
		const saved = localStorage.getItem("clients");
		if (saved) {
			try {
				const arr = JSON.parse(saved);
				if (Array.isArray(arr) && arr.length > 0)
					return arr.map(normalizeClient);
				return [];
			} catch {}
		}
		return initialClients;
	});
	const setClients = setExternalClients || setClientsInternal;
	const clientsData = externalClients || clients;
	const [filter, setFilter] = useState({ search: "", trainer: "", status: "" });
	const [modal, setModal] = useState({ open: false, editId: null });

	// Универсальная функция для нормализации клиента под актуальную структуру
	function normalizeClient(raw) {
		return { ...empty, ...raw };
	}

	// Сохранение в localStorage при изменении
	React.useEffect(() => {
		localStorage.setItem("clients", JSON.stringify(clients));
	}, [clients]);

	// Добавление/редактирование клиента
	const handleSave = (client) => {
		if (client.id) {
			setClients((prev) =>
				prev.map((c) =>
					c.id === client.id ? normalizeClient(client) : c
				)
			);
		} else {
			setClients((prev) => [
				...prev,
				normalizeClient({ ...client, id: Date.now(), attended: 0, deleted: false }),
			]);
		}
		setModal({ open: false, editId: null });
	};

	// Просмотр всей базы (включая удалённых)
	const [showAll, setShowAll] = useState(false);
	const filtered = (clientsData || []).filter((c) => {
		if (!showAll && c.deleted) return false;
		const matchesSearch =
			(c.name?.toLowerCase() || "").includes(filter?.search?.toLowerCase?.() || "") ||
			(c.phone || "").includes(filter?.search || "");
		const matchesTrainer = filter?.trainer ? c.trainer === filter.trainer : true;
		const matchesStatus = filter?.status ? c.status === filter.status : true;
		return matchesSearch && matchesTrainer && matchesStatus;
	});

	// Мягкое удаление клиента (оставляет в базе)
	const handleDelete = (id) => {
		if (window.confirm("Удалить этого клиента? Это действие необратимо.")) {
			setClients((prev) => prev.map((c) => (c.id === id ? { ...c, deleted: true } : c)));
		}
	};

	// Продление клиента на следующий месяц
	const handleExtend = (id) => {
		setClients((prev) =>
			prev.map((c) => {
				if (c.id !== id) return c;
				// Найти период
				const period = periods.find((p) => p.value === c.subscriptionPeriod);
				if (!period) return c;
				// Новые даты
				const newStart = c.endDate || new Date().toISOString().slice(0, 10);
				const start = new Date(newStart);
				const end = new Date(start);
				end.setMonth(start.getMonth() + Number(period.months));
				return {
					...c,
					startDate: newStart,
					endDate: end.toISOString().slice(0, 10),
					visits: [],
					paid: false,
					paymentAmount: period.price,
					totalSessions: period.trainings,
					status: "Активен",
					freeze: null,
				};
			})
		);
	};

	// Экспорт в Excel (фикс: русские заголовки)
	const handleExport = () => {
		const exportData = clients.map((c) => ({
			"Имя": c.name,
			"Фамилия": c.surname,
			"Телефон": c.phone,
			"Абонемент": c.subscription,
			"Тренер": c.trainer,
			"Статус": c.status,
			"Оплата": c.paid ? "Оплачено" : "Нет",
			"Осталось тренировок": c.totalSessions - c.attended,
			"Заморозка":
				c.status === "Заморожен" && c.freeze
					? `${c.freeze.start} - ${c.freeze.end}`
					: "-",
			"Посещений": Array.isArray(c.visits) ? c.visits.length : 0,
		}));
		const ws = XLSX.utils.json_to_sheet(exportData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Клиенты");
		const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
		saveAs(
			new Blob([wbout], { type: "application/octet-stream" }),
			`clients_${new Date().toISOString().slice(0, 10)}.xlsx`
		);
	};

	// Импорт из Excel
	const handleImport = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (evt) => {
			const data = new Uint8Array(evt.target.result);
			const workbook = XLSX.read(data, { type: "array" });
			const sheet = workbook.Sheets[workbook.SheetNames[0]];
			const imported = XLSX.utils.sheet_to_json(sheet);
			// Преобразуем данные: добавляем недостающие поля, id и т.д.
			const normalized = imported.map((c, i) =>
				normalizeClient({ ...c, id: c.id || Date.now() + i })
			);
			setClients(normalized);
		};
		reader.readAsArrayBuffer(file);
	};

	// Экспорт справочников в Excel
	const handleExportRefs = () => {
		const wb = XLSX.utils.book_new();
		wb.Props = { Title: "Справочники CRM" };
		// Периоды
		XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(periods), "Периоды");
		// Группы
		XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(groups), "Группы");
		// Способы оплаты
		XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(payments), "Оплата");
		// Настройки заморозки
		XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([freezeSettings]), "Заморозка");
		const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
		saveAs(
			new Blob([wbout], { type: "application/octet-stream" }),
			`refs_${new Date().toISOString().slice(0, 10)}.xlsx`
		);
	};

	// Импорт справочников из Excel
	const handleImportRefs = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (evt) => {
			const data = new Uint8Array(evt.target.result);
			const workbook = XLSX.read(data, { type: "array" });
			// Периоды
			const periodsSheet = workbook.Sheets["Периоды"];
			if (periodsSheet && setPeriods)
				setPeriods(XLSX.utils.sheet_to_json(periodsSheet));
			// Группы
			const groupsSheet = workbook.Sheets["Группы"];
			if (groupsSheet && setGroups)
				setGroups(XLSX.utils.sheet_to_json(groupsSheet));
			// Оплата
			const paymentsSheet = workbook.Sheets["Оплата"];
			if (paymentsSheet && setPayments)
				setPayments(XLSX.utils.sheet_to_json(paymentsSheet));
			// Заморозка
			const freezeSheet = workbook.Sheets["Заморозка"];
			if (freezeSheet && setFreezeSettings) {
				const arr = XLSX.utils.sheet_to_json(freezeSheet);
				if (arr && arr[0]) setFreezeSettings(arr[0]);
			}
		};
		reader.readAsArrayBuffer(file);
	};

	// Открыть модалку для добавления
	const handleAdd = () => setModal({ open: true, editId: null });
	// Открыть модалку для редактирования (только по кнопке 'Редактировать')
	const handleEdit = (id) => setModal({ open: true, editId: id });
	// Открыть модалку для продления
	const handleExtendModal = (id) => setModal({ open: true, editId: id, extend: true });
	// Открыть форму редактирования из карточки
	const handleForceEdit = (id) => setModal({ open: true, editId: id, forceEdit: true });

	// Данные для модалки
	const editingClient = clientsData.find((c) => c.id === modal.editId) || null;

	// Сброс базы клиентов
	const handleReset = () => {
		if (window.confirm('Вы уверены, что хотите полностью очистить базу клиентов? Это действие необратимо!')) {
			setClients([]);
			localStorage.removeItem('clients');
		}
	};

	// Для связи с модалкой через window (продлить, удалить, редактировать)
	React.useEffect(() => {
		window.handleExtendClient = handleExtend;
		window.handleDeleteClient = handleDelete;
		window.handleEditClient = (id) => {
			setModal({ open: true, editId: id, forceEdit: true });
		};
		return () => {
			window.handleExtendClient = undefined;
			window.handleDeleteClient = undefined;
			window.handleEditClient = undefined;
		};
	}, [clients, periods]);

	// Режим редактирования из карточки
	const isEditMode = modal.open && modal.forceEdit;

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
						onClick={handleExport}
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
			<Filters filter={filter} setFilter={setFilter} clients={clientsData} />
			<Table
				clients={filtered}
				onEdit={handleEdit}
				onDelete={handleDelete}
				periods={periods}
				groups={groups}
				onExtend={handleExtendModal}
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
