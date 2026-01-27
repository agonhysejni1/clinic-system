// src/pages/Appointments.jsx
import DashboardLayout from "../components/layout/DashboardLayout";
import AppointmentList from "../components/appointments/AppointmentList";

export default function Appointments() {
  return (
    <DashboardLayout>
      <AppointmentList />
    </DashboardLayout>
  );
}
