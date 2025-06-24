// Хедер приложения
const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Challenger CRM
        </h1>
        <div className="text-sm text-gray-500">
          Система управления боксерским клубом
        </div>
      </div>
    </header>
  );
};

export default Header;
