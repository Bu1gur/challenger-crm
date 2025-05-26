import React from "react";

const navItems = [
	{
		key: "clients",
		label: "Клиенты",
		icon: (
			<svg
				className="w-6 h-6"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				viewBox="0 0 24 24"
			>
				<path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0zm6 4v6m0 0h-6m6 0l-2-2m-8-4v6m0 0H3m6 0l2-2" />
			</svg>
		),
	},
	{
		key: "trainers",
		label: "Тренеры",
		icon: (
			<svg
				className="w-6 h-6"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				viewBox="0 0 24 24"
			>
				<circle cx="12" cy="7" r="4" />
				<path d="M5.5 21a7.5 7.5 0 0113 0" />
			</svg>
		),
	},
	{
		key: "admin",
		label: "Админка",
		icon: (
			<svg
				className="w-6 h-6"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				viewBox="0 0 24 24"
			>
				<rect x="4" y="4" width="16" height="16" rx="5" />
				<path d="M8 12h8M12 8v8" />
			</svg>
		),
	},
];

const Sidebar = ({ section, setSection }) => {
	return (
		<aside className="hidden md:flex flex-col w-56 py-8 px-2 bg-white/80 h-[calc(100vh-48px)] mt-2 rounded-3xl shadow-2xl border border-gray-100 animate-fade-in gap-2">
			<nav className="flex flex-col gap-2 w-full">
				{navItems.map((item) => (
					<button
						key={item.key}
						onClick={() => setSection(item.key)}
						className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200
              ${section === item.key
								? "bg-gradient-to-r from-blue-100 to-blue-300 text-blue-800 shadow-xl scale-[1.03]"
								: "bg-white text-gray-500 hover:bg-blue-50 hover:text-blue-700"}
            `}
						style={{ minHeight: 56 }}
					>
						<span className="flex-shrink-0">{item.icon}</span>
						<span className="truncate">{item.label}</span>
					</button>
				))}
			</nav>
		</aside>
	);
};

export default Sidebar;
