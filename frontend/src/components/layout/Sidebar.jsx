import { Link, useLocation } from "react-router";
import { useAuth } from "../../auth/AuthContext";

export default function Sidebar() {
  const loc = useLocation();
  const { user } = useAuth();

  const Item = ({ to, label }) => (
    <Link
      to={to}
      className={`block px-2 py-2 rounded ${loc.pathname === to ? "bg-gray-700 text-white" : "text-gray-300 hover:text-white hover:bg-gray-700"}`}
    >
      {label}
    </Link>
  );

  return (
    <aside className="hidden md:block w-64 bg-gray-800 p-6">
      <h2 className="text-xl font-bold mb-6 text-white">Clinic System</h2>
      <nav className="space-y-3">
        <Item to="/" label="Dashboard" />
        <Item to="/appointments" label="Appointments" />
        {user?.role === "DOCTOR" || user?.role === "ADMIN" ? (
          <Item to="/doctors" label="Doctors" />
        ) : null}
        <Item to={"/profile"} label="Profile" />
      </nav>
    </aside>
  );
}
