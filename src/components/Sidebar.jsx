import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  LogOut,
  X,
  File,
} from "lucide-react"; // ajout File pour Templates
import { useDispatch } from "react-redux";
import { logout } from "../features/auth/authThunks";
import { useState } from "react";

const menu = [
  { label: "Accueil", icon: <HomeIcon size={20} />, to: "/" },
  { label: "Dashboard", icon: <LayoutDashboard size={20} />, to: "/dashboard" },
  { label: "Agents", icon: <Users size={20} />, to: "/agents" },
  { label: "Templates", icon: <File size={20} />, to: "/templates" }, // ← nouvel élément
  { label: "Paramètres", icon: <Settings size={20} />, to: "/settings" },
  { label: "Logs", icon: <FileText size={20} />, to: "/logs" },
];

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingLogout, setLoadingLogout] = useState(false);

  const handleLogout = async () => {
    if (loadingLogout) return;
    setLoadingLogout(true);
    try {
      await dispatch(logout()).unwrap();
      navigate("/login");
    } catch (err) {
      console.error("Erreur lors du logout :", err);
      alert("Impossible de se déconnecter, réessayez.");
    } finally {
      setLoadingLogout(false);
    }
  };

  return (
    <aside className="flex flex-col h-full bg-white border-r shadow-sm w-64">
      {onClose && (
        <div className="sm:hidden flex justify-between items-center p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">IA Admin</h1>
          <button onClick={onClose} aria-label="Fermer sidebar">
            <X size={24} />
          </button>
        </div>
      )}

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
              onClick={onClose}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          disabled={loadingLogout}
          className={`flex items-center w-full px-4 py-2 text-sm rounded-lg transition ${
            loadingLogout
              ? "bg-red-200 text-red-400 cursor-not-allowed"
              : "text-red-600 hover:bg-red-100"
          }`}
        >
          <LogOut size={20} className="mr-3" />
          {loadingLogout ? "Déconnexion..." : "Déconnexion"}
        </button>
      </div>
    </aside>
  );
}
