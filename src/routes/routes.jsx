import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Agents from "../pages/Agents";
import Settings from "../pages/Settings";
import Logs from "../pages/Logs";
import Login from "../pages/Login";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home";
import PrivateRoute from "../components/PrivateRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logs" element={<Logs />} />
        </Route>
      </Route>
      {/* rediriger tout ce qui ne matche pas vers home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
