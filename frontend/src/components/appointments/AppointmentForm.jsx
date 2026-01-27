// src/components/appointments/AppointmentForm.jsx
import { useEffect, useState } from "react";
import { createAppointment, getDoctors } from "../../api/appointment.api";
import { useAuth } from "../../auth/AuthContext";

export default function AppointmentForm({ onCreated, onCancel }) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState(""); // admin only

  useEffect(() => {
    (async () => {
      try {
        const d = await getDoctors();
        setDoctors(d);
        if (d.length > 0) setDoctorId(d[0].id);
      } catch (e) {
        console.error(e);
        alert("Failed to load doctors");
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId || !date) return alert("doctor and date required");
    setLoading(true);
    try {
      const payload = { doctorId: Number(doctorId), date: new Date(date).toISOString() };
      // admin may choose patientId explicitly
      if (user?.role === "ADMIN") {
        if (!patientId) return alert("Admin must provide patientId");
        payload.patientId = Number(patientId);
      }
      const created = await createAppointment(payload);
      onCreated(created);
    } catch (err) {
      console.error(err);
      alert("Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-200 mb-1">Doctor</label>
        <select className="w-full p-2 rounded bg-gray-700 text-white" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.user?.name || d.user?.email || `Doctor ${d.id}`}
            </option>
          ))}
        </select>
      </div>

      {user?.role === "ADMIN" && (
        <div>
          <label className="block text-sm text-gray-200 mb-1">Patient ID (for admin)</label>
          <input className="w-full p-2 rounded bg-gray-700 text-white" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-200 mb-1">Date & Time</label>
        <input type="datetime-local" className="w-full p-2 rounded bg-gray-700 text-white" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1 rounded bg-gray-600">Cancel</button>
        <button type="submit" disabled={loading} className="px-3 py-1 rounded bg-green-600">
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
