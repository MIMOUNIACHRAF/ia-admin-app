// src/routes/routes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Agents from "../pages/Agents";
import Settings from "../pages/Settings";
import Logs from "../pages/Logs";
import Login from "../pages/Login";
import AdminLayout from "../layouts/AdminLayout";
import { useAuth } from "../context/AuthContext";

// Composant pour protéger les routes
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Page publique */}
      <Route path="/login" element={<Login />} />

      {/* Pages protégées */}
      <Route
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/logs" element={<Logs />} />
      </Route>
    </Routes>
  );
}
