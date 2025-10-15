import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import AgentsPage from "../pages/AgentsPage";
import TemplatesPage from "../pages/TemplatesPage";
import Settings from "../pages/Settings";
import Logs from "../pages/Logs";
import Login from "../pages/Login";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home";
import { PrivateRoute, PublicRoute } from "../components/PrivateRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Page login protégée : redirige si déjà connecté */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Routes privées */}
      <Route element={<PrivateRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/logs" element={<Logs />} />
        </Route>
      </Route>

      {/* Redirection automatique si route non définie */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
