import { useEffect, useState } from "react";
import { getAppointments, updateAppointmentStatus, deleteAppointment } from "../../api/appointment.api";
import AppointmentModal from "./AppointmentModal";
import { useAuth } from "../../auth/AuthContext";

export default function AppointmentList() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const openCreate = () => {
    setSelected(null);
    setShowModal(true);
  };

  const onCreated = () => {
    setShowModal(false);
    fetch();
  };

  const onStatus = async (id, status) => {
    if (!confirm(`Change status to ${status}?`)) return;
    try {
      await updateAppointmentStatus(id, status);
      fetch();
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete/cancel appointment?")) return;
    try {
      await deleteAppointment(id);
      fetch();
    } catch (e) {
      console.error(e);
      alert("Failed to delete appointment");
    }
  };

  const isDoctorOfAppointment = (a) => {
   
    return user && a?.doctor?.user?.id === user.id;
  };
  const isPatientOfAppointment = (a) => {
    return user && a?.patient?.user?.id === user.id;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Appointments</h2>

        {/* Create: only PATIENT or ADMIN */}
        {(user?.role === "PATIENT" || user?.role === "ADMIN") && (
          <button onClick={openCreate} className="bg-green-600 px-3 py-1 rounded">New</button>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Doctor</th>
                <th className="px-4 py-2">Patient</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {appointments.length === 0 && (
                <tr><td colSpan="6" className="p-4 text-center">No appointments</td></tr>
              )}
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">{a.id}</td>
                  <td className="px-4 py-3">{a.doctor?.user?.name || a.doctor?.user?.email || "—"}</td>
                  <td className="px-4 py-3">{a.patient?.user?.name || a.patient?.user?.email || "—"}</td>
                  <td className="px-4 py-3">{new Date(a.date).toLocaleString()}</td>
                  <td className="px-4 py-3">{a.status}</td>
                  <td className="px-4 py-3 space-x-2">
                    {user?.role === "DOCTOR" && isDoctorOfAppointment(a) && a.status === "PENDING" && (
                      <>
                        <button onClick={() => onStatus(a.id, "APPROVED")} className="px-2 py-1 bg-blue-600 rounded">Approve</button>
                        <button onClick={() => onStatus(a.id, "CANCELED")} className="px-2 py-1 bg-red-600 rounded">Cancel</button>
                      </>
                    )}

                    {user?.role === "PATIENT" && isPatientOfAppointment(a) && (
                      <button onClick={() => onDelete(a.id)} className="px-2 py-1 bg-red-600 rounded">Cancel</button>
                    )}

                    {user?.role === "ADMIN" && (
                      <>
                        <button onClick={() => onStatus(a.id, a.status === "PENDING" ? "APPROVED" : "PENDING")} className="px-2 py-1 bg-blue-600 rounded">Toggle</button>
                        <button onClick={() => onDelete(a.id)} className="px-2 py-1 bg-red-600 rounded">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <AppointmentModal onClose={() => setShowModal(false)} onCreated={onCreated} />}
    </div>
  );
}
