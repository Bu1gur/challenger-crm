// Хедер приложения
const Header = () => {
  return (
    <header className="shadow-none p-0 bg-white/80 mb-2 rounded-3xl border border-gray-100 flex items-center justify-between px-8 py-4 animate-fade-in">
      {/* Можно добавить логотип и название CRM */}
      <div className="flex items-center gap-4">
        <img src="/challenger-crm/challenger-logo.png" alt="logo" className="h-10 w-10 rounded-full bg-white shadow" />
        <span className="text-2xl font-extrabold text-gray-900 tracking-tight">Challenger CRM</span>
      </div>
      {/* Здесь могут быть кнопки/профиль/настройки */}
    </header>
  );
};

export default Header;
