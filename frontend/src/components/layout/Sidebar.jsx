import { Link } from "react-router";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 p-6">
      <h2 className="text-xl font-bold mb-6">Clinic System</h2>
      <nav className="space-y-3">
        <Link to="/" className="block hover:text-blue-400">Dashboard</Link>
        <Link to="/appointments" className="block hover:text-blue-400">
          Appointments
        </Link>
      </nav>
    </aside>
  );
}
