// src/components/appointments/AppointmentModal.jsx
import AppointmentForm from "./AppointmentForm";

export default function AppointmentModal({ onClose, onCreated }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">New Appointment</h3>
          <button onClick={onClose} className="text-gray-400">Close</button>
        </div>
        <AppointmentForm onCreated={onCreated} onCancel={onClose} />
      </div>
    </div>
  );
}
