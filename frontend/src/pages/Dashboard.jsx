import DashboardLayout from "../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router";

export default function Dashboard() {
  const [counts, setCounts] = useState({ doctors: 0, patients: 0, appointments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const [doctorsRes, patientsRes, apptsRes] = await Promise.all([
          api.get("/doctors"),
          api.get("/patients").catch(() => ({ data: [] })),
          api.get("/appointments"),
        ]);
        if (!mounted) return;
        setCounts({
          doctors: Array.isArray(doctorsRes.data) ? doctorsRes.data.length : 0,
          patients: Array.isArray(patientsRes.data) ? patientsRes.data.length : 0,
          appointments: Array.isArray(apptsRes.data) ? apptsRes.data.length : 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard counts", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCounts();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Welcome to Clinic Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800 border border-gray-700 rounded">
            <div className="text-sm text-gray-400">Doctors</div>
            <div className="text-3xl font-bold">{loading ? "..." : counts.doctors}</div>
          </div>

          <div className="p-4 bg-gray-800 border border-gray-700 rounded">
            <div className="text-sm text-gray-400">Patients</div>
            <div className="text-3xl font-bold">{loading ? "..." : counts.patients}</div>
          </div>

          <div className="p-4 bg-gray-800 border border-gray-700 rounded">
            <div className="text-sm text-gray-400">Appointments</div>
            <div className="text-3xl font-bold">{loading ? "..." : counts.appointments}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 bg-gray-800 rounded border border-gray-700">
            <h2 className="font-semibold">Quick actions</h2>
            <div className="mt-2 flex gap-2">
              <Link to="/appointments" className="px-3 py-1 bg-blue-600 rounded">View appointments</Link>
              <Link to="/doctors" className="px-3 py-1 bg-gray-600 rounded">View doctors</Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
