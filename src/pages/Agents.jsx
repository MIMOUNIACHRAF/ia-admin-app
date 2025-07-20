import React, { useState } from "react";
import { useAgents } from "../context/AgentsContext";

export default function Agents() {
  const { agents, addAgent, removeAgent } = useAgents();
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!newName.trim() || !newRole.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    addAgent({ id: Date.now(), name: newName.trim(), role: newRole.trim() });
    setNewName("");
    setNewRole("");
    setError("");
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Liste des Agents</h1>

      <ul className="divide-y divide-gray-200 mb-8">
        {agents.length === 0 && (
          <li className="py-4 text-center text-gray-500">Aucun agent pour l'instant.</li>
        )}
        {agents.map((agent) => (
          <li
            key={agent.id}
            className="flex items-center justify-between py-4 hover:bg-gray-50 transition rounded"
          >
            <div>
              <p className="text-lg font-semibold text-gray-800">{agent.name}</p>
              <p className="text-sm text-gray-500">{agent.role}</p>
            </div>
            <button
              onClick={() => removeAgent(agent.id)}
              className="text-red-600 hover:text-red-800 transition"
              aria-label={`Supprimer ${agent.name}`}
              title={`Supprimer ${agent.name}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Nom de l'agent"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Rôle"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white rounded-md px-6 py-3 font-semibold hover:bg-blue-700 transition"
          aria-label="Ajouter un agent"
        >
          Ajouter
        </button>
      </div>

      {error && (
        <p className="mt-4 text-red-600 font-medium text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
