import { useAuth } from "../../auth/AuthContext";

export default function Navbar() {
  const { logout, user } = useAuth();

  return (
    <header className="flex justify-between items-center bg-gray-800 px-6 py-3 border-b border-gray-700">
      <div className="flex items-center gap-4">
        <button
          className="text-gray-300 hover:text-white md:hidden"
        >
          ☰
        </button>
        <div>
          <span className="text-lg font-semibold text-white">Clinic Dashboard</span>
          <div className="text-sm text-gray-400">Dark mode • Flow style</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="text-right">
              <div className="text-sm text-gray-300">{user?.name || user?.email || "User"}</div>
              <div className="text-xs text-gray-400">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <div className="text-gray-400">Not signed in</div>
        )}
      </div>
    </header>
  );
}
