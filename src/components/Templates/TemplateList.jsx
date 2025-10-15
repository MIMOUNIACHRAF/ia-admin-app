import React from "react";

export default function TemplateList({ templates, onEdit, onDelete }) {
  return (
    <div className="space-y-2">
      {templates.map(t => (
        <div key={t.id} className="border p-3 rounded flex justify-between items-center">
          <div>
            <h3 className="font-bold">{t.nom}</h3>
            <p>{t.description}</p>
          </div>
          <div className="space-x-2">
            <button onClick={() => onEdit(t)} className="px-3 py-1 bg-yellow-400 rounded">Edit</button>
            <button onClick={() => onDelete(t.id)} className="px-3 py-1 bg-red-500 text-white rounded">Supprimer</button>
          </div>
        </div>
      ))}
    </div>
  );
}
