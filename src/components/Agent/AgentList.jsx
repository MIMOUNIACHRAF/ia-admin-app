import React from "react";

export default function AgentList({ agents, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map(agent => (
        <div key={agent.id} className="bg-white border rounded-xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{agent.nom}</h3>
            <p className="text-gray-600 mt-1">{agent.description}</p>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => onEdit(agent)} className="flex-1 px-3 py-1 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 transition">
              Edit
            </button>
            <button onClick={() => onDelete(agent.id)} className="flex-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

