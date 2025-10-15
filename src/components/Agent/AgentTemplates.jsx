import React from "react";

export default function AgentTemplates({ agent, templates, onAssign, onUnassign }) {
  const assigned = templates.filter(t => agent.templates.includes(t.id));
  const unassigned = templates.filter(t => !agent.templates.includes(t.id));

  return (
    <div className="flex space-x-4">
      <div className="flex-1 border p-3 rounded">
        <h4 className="font-bold mb-2">Assigné</h4>
        {assigned.map(t => (
          <div key={t.id} className="flex justify-between items-center mb-1">
            <span>{t.nom}</span>
            <button onClick={() => onUnassign(agent.id, t.id)} className="px-2 py-1 bg-red-500 text-white rounded">Retirer</button>
          </div>
        ))}
      </div>
      <div className="flex-1 border p-3 rounded">
        <h4 className="font-bold mb-2">Disponible</h4>
        {unassigned.map(t => (
          <div key={t.id} className="flex justify-between items-center mb-1">
            <span>{t.nom}</span>
            <button onClick={() => onAssign(agent.id, t.id)} className="px-2 py-1 bg-green-500 text-white rounded">Assigner</button>
          </div>
        ))}
      </div>
    </div>
  );
}
