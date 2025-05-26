// Заглушка для data
export const exampleData = [];

// Пример актуальных справочников для CRM
export const periods = [
	{
		value: "1m",
		label: "Месячный — 4000 сом",
		price: 4000,
		months: 1,
		trainings: 12,
	},
	{
		value: "3m",
		label: "3 месяца — 11000 сом",
		price: 11000,
		months: 3,
		trainings: 36,
	},
	{
		value: "6m",
		label: "6 месяцев — 21000 сом",
		price: 21000,
		months: 6,
		trainings: 72,
	},
];

export const payments = [
	{ value: "cash", label: "Наличные" },
	{ value: "card", label: "Карта" },
	{ value: "transfer", label: "Перевод" },
];

export const groups = [
	{ value: "none", name: "Без группы" },
	{ value: "kids", name: "Дети" },
	{ value: "adults", name: "Взрослые" },
];

export const freezeSettings = {
	reasons: ["Болезнь", "Отпуск", "Учёба", "Другое"],
	maxDays: 30,
	requireConfirm: false,
};
