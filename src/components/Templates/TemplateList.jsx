import React from "react";

export default function TemplateList({ templates, onEdit, onDelete }) {
  return (
    <div className="space-y-2">
      {templates.map((t) => (
        <div
          key={t.id}
          className="border p-3 rounded flex justify-between items-center bg-white shadow-sm"
        >
          <div>
            <h3 className="font-bold text-gray-800">{t.nom}</h3>
            <p className="text-gray-600">{t.description}</p>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => onEdit(t)}
              className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 rounded"
            >
              Modifier
            </button>
            <button
              onClick={() => onDelete(t.id)}
              className="px-3 py-1 bg-red-500 text-white hover:bg-red-600 rounded"
            >
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
