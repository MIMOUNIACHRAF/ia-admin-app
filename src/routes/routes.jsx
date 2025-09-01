import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Agents from "../pages/Agents";
import Settings from "../pages/Settings";
import Logs from "../pages/Logs";
import Login from "../pages/Login";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home";
import PrivateRoute from "../components/PrivateRoute";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSelectors";

export default function AppRoutes() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Routes>
      {/* page login : si déjà connecté, redirige vers / */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

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

      {/* redirection automatique pour routes inconnues */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}
