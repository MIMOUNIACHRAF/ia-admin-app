import { Link, useLocation } from "react-router-dom";
import {
    Home as HomeIcon,
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const menu = [
    { label: "Accueil", icon: <HomeIcon size={20} />, to: "/" }, // ← nouveau
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, to: "/dashboard" },
  { label: "Agents", icon: <Users size={20} />, to: "/agents" },
  { label: "Paramètres", icon: <Settings size={20} />, to: "/settings" },
  { label: "Logs", icon: <FileText size={20} />, to: "/logs" },
];

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="flex flex-col h-full bg-white border-r shadow-sm w-64">
      {/* Mobile header avec bouton fermer */}
      {onClose && (
        <div className="sm:hidden flex justify-between items-center p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">IA Admin</h1>
          <button onClick={onClose} aria-label="Fermer sidebar">
            <X size={24} />
          </button>
        </div>
      )}

      {/* Header desktop */}
      {!onClose && (
        <div className="hidden sm:block p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">IA Admin</h1>
        </div>
      )}

      <nav className="flex flex-col p-4 gap-2 flex-1 overflow-y-auto">
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
              onClick={onClose} // ferme sidebar mobile au clic sur un lien
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
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
