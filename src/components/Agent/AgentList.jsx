import React from "react";

export default function AgentList({ agents, onEdit, onDelete }) {
  return (
    <div className="space-y-2">
      {agents.map(agent => (
        <div key={agent.id} className="border p-3 rounded flex justify-between items-center">
          <div>
            <h3 className="font-bold">{agent.nom}</h3>
            <p>{agent.description}</p>
          </div>
          <div className="space-x-2">
            <button onClick={() => onEdit(agent)} className="px-3 py-1 bg-yellow-400 rounded">Edit</button>
            <button onClick={() => onDelete(agent.id)} className="px-3 py-1 bg-red-500 text-white rounded">Supprimer</button>
          </div>
        </div>
      ))}
    </div>
  );
}
