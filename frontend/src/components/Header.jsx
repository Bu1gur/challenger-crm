// Хедер приложения
const Header = () => {
  return (
    <header className="shadow-none p-0 bg-white/80 mb-2 rounded-3xl border border-gray-100 flex items-center justify-between px-10 py-6 animate-fade-in">
      <span className="text-3xl font-extrabold text-gray-900 tracking-tight drop-shadow-sm select-none">
        Challenger CRM
      </span>
      {/* Здесь могут быть кнопки/профиль/настройки */}
    </header>
  );
};

export default Header;
