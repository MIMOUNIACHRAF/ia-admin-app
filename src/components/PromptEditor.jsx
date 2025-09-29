import React from "react";

export default function PromptEditor({ prompts = [], onChange, onAdd, onRemove }) {
  return (
    <div className="mt-3 bg-gray-50 p-4 rounded border">
      <h4 className="font-semibold mb-2">Questions / Réponses</h4>
      {prompts.length === 0 && <p className="text-gray-500">Aucune question définie.</p>}
      {prompts.map((p, idx) => (
        <div key={p.id ?? idx} className="grid grid-cols-1 sm:grid-cols-6 gap-2 mb-2 items-start">
          <input className="sm:col-span-3 p-2 border rounded" placeholder="Question" value={p.question} onChange={(e) => onChange(idx, "question", e.target.value)} />
          <input className="sm:col-span-2 p-2 border rounded" placeholder="Réponse" value={p.reponse} onChange={(e) => onChange(idx, "reponse", e.target.value)} />
          <button className="text-red-600 text-sm" onClick={() => onRemove(idx)} aria-label={`Supprimer question ${idx + 1}`}>Supprimer</button>
        </div>
      ))}
      <button className="mt-2 bg-green-600 text-white px-3 py-2 rounded" onClick={onAdd}>Ajouter une question</button>
    </div>
  );
}
