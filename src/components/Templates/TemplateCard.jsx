import React from "react";
import { motion } from "framer-motion";

export default function TemplateCard({
  template,
  editingTemplate,
  setEditingTemplate,
  onOpenQuestions,
  onDelete, // 🔹 ajout du callback pour supprimer
}) {
  const isEditing = editingTemplate?.id === template.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        backgroundColor: isEditing ? "#FEF9C3" : "#ffffff",
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl shadow-lg p-4 flex flex-col justify-between transition-all"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{template.nom}</h3>
          <p className="text-gray-500 text-sm">{template.description}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setEditingTemplate(template)}
            className="text-yellow-500 hover:text-yellow-600"
            title="Modifier"
          >
            ✏️
          </button>

          <button
            onClick={() => onOpenQuestions(template)}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            Voir questions
          </button>

          <button
            onClick={() => {
              if (window.confirm("Supprimer ce template ?")) {
                onDelete(template.id);
              }
            }}
            className="text-red-500 hover:text-red-600 text-sm"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      </div>
    </motion.div>
  );
}
