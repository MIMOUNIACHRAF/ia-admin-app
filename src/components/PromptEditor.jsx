import React from "react";

export default function PromptEditor({ prompts, onChange, onAdd, onRemove }) {
  return (
    <div className="mt-3">
      <h4 className="font-semibold mb-2">Questions / Réponses</h4>
      {prompts.map((p, idx) => (
        <div key={idx} className="grid grid-cols-2 gap-2 mb-2">
          <input
            className="p-2 border rounded"
            placeholder="Question"
            value={p.question}
            onChange={(e) => onChange(idx, "question", e.target.value)}
          />
          <input
            className="p-2 border rounded"
            placeholder="Réponse"
            value={p.reponse}
            onChange={(e) => onChange(idx, "reponse", e.target.value)}
          />
          <button className="text-red-500 hover:underline" onClick={() => onRemove(idx)}>Supprimer</button>
        </div>
      ))}
      <button className="text-blue-600 hover:underline mt-2" onClick={onAdd}>Ajouter une question</button>
    </div>
  );
}
