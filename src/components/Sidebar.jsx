// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const menu = [
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, to: "/" },
  { label: "Agents", icon: <Users size={20} />, to: "/agents" },
  { label: "Paramètres", icon: <Settings size={20} />, to: "/settings" },
  { label: "Logs", icon: <FileText size={20} />, to: "/logs" },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="w-64 h-screen bg-white border-r shadow-sm flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">IA Admin</h1>
      </div>

      <nav className="flex flex-col p-4 gap-2">
        {menu.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition ${
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-100 transition"
        >
          <LogOut size={20} className="mr-3" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
