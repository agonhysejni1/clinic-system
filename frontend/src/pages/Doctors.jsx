import DashboardLayout from "../components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { getDoctors } from "../api/appointment.api";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const d = await getDoctors();
        if (!mounted) return;
        setDoctors(d);
      } catch (err) {
        console.error(err);
        alert("Failed to load doctors");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-4">Doctors</h1>
        {loading ? <div>Loading...</div> : (
          <div className="bg-gray-800 rounded overflow-x-auto border border-gray-700">
            <table className="min-w-full">
              <thead className="text-left text-gray-400">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Specialty</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 && <tr><td colSpan="4" className="p-4">No doctors found</td></tr>}
                {doctors.map((d) => (
                  <tr key={d.id} className="border-t border-gray-700">
                    <td className="px-4 py-3">{d.id}</td>
                    <td className="px-4 py-3">{d.user?.name || d.user?.email}</td>
                    <td className="px-4 py-3">{d.user?.email}</td>
                    <td className="px-4 py-3">{d.specialty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
