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
      {/* page login accessible toujours */}
      <Route path="/login" element={<Login />} />

      {/* routes privées */}
      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logs" element={<Logs />} />
        </Route>
      </Route>

      {/* redirection automatique : si utilisateur arrive sur / ou n’importe quelle route non définie */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
