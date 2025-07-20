// src/layouts/AdminLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gray-100">
      {/* Top bar (mobile only) */}
      <div className="sm:hidden flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-xl font-bold">IA Admin</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } sm:block fixed sm:relative z-30 bg-gray-900 text-white w-64 h-full sm:h-auto`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 mt-4 sm:mt-0">
        <Outlet />
      </main>
    </div>
  );
}
