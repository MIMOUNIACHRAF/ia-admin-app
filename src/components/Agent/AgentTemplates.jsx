import React from "react";

export default function AgentTemplates({ agent, templates, onAssign, onUnassign }) {
  const assignedIds = Array.isArray(agent.templates)
    ? agent.templates.map(t => (typeof t === "object" ? t.id : t))
    : [];

  const assigned = templates.filter(t => assignedIds.includes(t.id));
  const unassigned = templates.filter(t => !assignedIds.includes(t.id));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Assignés */}
      <div className="bg-white border rounded-xl shadow-md p-4 space-y-2">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Assigné</h4>
        {assigned.length === 0 && (
          <p className="text-gray-500 italic">Aucun template assigné.</p>
        )}
        {assigned.map(t => (
          <div
            key={t.id}
            className="flex justify-between items-center p-2 border rounded-lg hover:shadow-sm transition"
          >
            <span className="text-gray-800">{t.nom}</span>
            <button
              onClick={() => onUnassign(agent.id, t.id)}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>

      {/* Disponibles */}
      <div className="bg-white border rounded-xl shadow-md p-4 space-y-2">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Disponible</h4>
        {unassigned.length === 0 && (
          <p className="text-gray-500 italic">Tous les templates sont assignés.</p>
        )}
        {unassigned.map(t => (
          <div
            key={t.id}
            className="flex justify-between items-center p-2 border rounded-lg hover:shadow-sm transition"
          >
            <span className="text-gray-800">{t.nom}</span>
            <button
              onClick={() => onAssign(agent.id, t.id)}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Assigner
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
