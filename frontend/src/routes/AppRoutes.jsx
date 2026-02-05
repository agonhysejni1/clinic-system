import { BrowserRouter, Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import RequireAuth from "../auth/RequireAuth";

const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Appointments = lazy(() => import("../pages/Appointments"));
const Doctors = lazy(() => import("../pages/Doctors"));
const Profile = lazy(() => import("../pages/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="text-white p-4">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/profile" element={<Profile />} />

          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
