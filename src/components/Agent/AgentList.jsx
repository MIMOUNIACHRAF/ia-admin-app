import React from "react";

export default function AgentList({ agents, onEdit, onDelete }) {
  if (!agents || agents.length === 0)
    return <p className="text-gray-500 italic">Aucun agent disponible.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map(agent => (
        <div
          key={agent.id}
          className="bg-white border rounded-2xl shadow-md p-5 flex flex-col justify-between hover:shadow-xl transition transform hover:scale-[1.02]"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{agent.nom}</h3>
              <p className="text-gray-600 mt-1">{agent.description}</p>
            </div>
            {/* Badge type agent */}
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                agent.type_agent === "ia" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              {agent.type_agent === "ia" ? "IA" : "Traditionnel"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => onEdit(agent)}
              className="flex-1 px-4 py-2 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 transition font-semibold"
            >
              ✏️ Modifier
            </button>
            <button
              onClick={() => onDelete(agent.id)}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
