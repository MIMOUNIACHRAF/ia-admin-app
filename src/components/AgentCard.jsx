// src/components/AgentCard.jsx
import React from "react";

export default function AgentCard({ agent, index, onEdit, onDelete }) {
  return (
    <div className="bg-white p-4 shadow-md rounded-xl mb-4 flex justify-between items-start">
      <div>
        <h2 className="text-lg font-semibold text-blue-600">{agent.name}</h2>
        <p className="text-sm text-gray-500"><strong>Rôle :</strong> {agent.role}</p>
        <p className="text-sm text-gray-500 mt-2"><strong>Prompt :</strong> {agent.prompt}</p>
      </div>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => onEdit(index)}
          className="text-blue-500 hover:underline text-sm"
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(index)}
          className="text-red-500 hover:underline text-sm"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
