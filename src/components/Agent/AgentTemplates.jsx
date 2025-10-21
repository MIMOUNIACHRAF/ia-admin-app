import React from "react";
import { motion } from "framer-motion";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

// Composant réutilisable pour chaque template
const TemplateCard = ({ template, onClick, buttonLabel, buttonColor }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex justify-between items-center p-3 border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
  >
    <span className="text-gray-800">{template.nom}</span>
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-lg text-white font-semibold transition ${buttonColor} hover:opacity-90 flex items-center gap-1`}
    >
      {buttonLabel === "Assigner" ? <CheckIcon className="w-4 h-4" /> : <XMarkIcon className="w-4 h-4" />}
      {buttonLabel}
    </button>
  </motion.div>
);

export default function AgentTemplates({ agent, templates, onAssign, onUnassign }) {
  const assignedIds = Array.isArray(agent.templates)
    ? agent.templates.map(t => (typeof t === "object" ? t.id : t))
    : [];

  const assigned = templates.filter(t => assignedIds.includes(t.id));
  const unassigned = templates.filter(t => !assignedIds.includes(t.id));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Assignés */}
      <div className="bg-white border rounded-2xl shadow-md p-4 space-y-3">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Assigné</h4>
        {assigned.length === 0 ? (
          <p className="text-gray-500 italic">Aucun template assigné.</p>
        ) : (
          assigned.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onClick={() => onUnassign(agent.id, t.id)}
              buttonLabel="Retirer"
              buttonColor="bg-red-500"
            />
          ))
        )}
      </div>

      {/* Disponibles */}
      <div className="bg-white border rounded-2xl shadow-md p-4 space-y-3">
        <h4 className="text-lg font-semibold text-gray-700 mb-2">Disponible</h4>
        {unassigned.length === 0 ? (
          <p className="text-gray-500 italic">Tous les templates sont assignés.</p>
        ) : (
          unassigned.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onClick={() => onAssign(agent.id, t.id)}
              buttonLabel="Assigner"
              buttonColor="bg-green-500"
            />
          ))
        )}
      </div>
    </div>
  );
}
