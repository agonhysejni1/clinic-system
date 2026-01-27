import { useAuth } from "../../auth/AuthContext";

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <header className="flex justify-between items-center bg-gray-800 px-6 py-4">
      <span className="font-semibold">Dashboard</span>
      <button
        onClick={logout}
        className="bg-red-600 px-4 py-1 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </header>
  );
}
