import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col sm:flex-row bg-gray-100">
      {/* Barre mobile */}
      <div className="sm:hidden flex justify-between items-center p-4 bg-white shadow-md">
        <h1 className="text-xl font-bold">IA Dashboard</h1>
        <button onClick={() => setSidebarOpen(true)} aria-label="Ouvrir sidebar">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)}></div>
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform bg-white shadow-lg w-64 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } sm:relative sm:translate-x-0 sm:flex sm:flex-col sm:h-auto`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Contenu principal */}
      <main className="flex-1 p-4 sm:p-6 mt-4 sm:mt-0">
        {children}
      </main>
    </div>
  );
}
