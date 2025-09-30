import React, { useState } from "react";
import { useAgents } from "../hooks/useAgents";
import PromptEditor from "./PromptEditor";

export default function AgentItem({ agent }) {
  const { updateAgent, removeAgent } = useAgents();
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState({ ...agent });

  const onField = (k, v) => setLocal((prev) => ({ ...prev, [k]: v }));

  const save = () => {
    updateAgent(agent.id, local);
    setEditing(false);
  };

  const del = () => {
    if (window.confirm("Supprimer cet agent ?")) removeAgent(agent.id);
  };

  return (
    <div className="border rounded p-4 mb-4 bg-white">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          {editing ? (
            <input className="text-xl font-semibold w-full p-2 border rounded" value={local.nom} onChange={(e) => onField("nom", e.target.value)} />
          ) : (
            <h3 className="text-xl font-semibold">{agent.nom}</h3>
          )}
          <p className="text-sm text-gray-600">{agent.description}</p>
          <p className="text-sm mt-1">
            <strong>Type:</strong> {agent.type_agent} • <strong>Actif:</strong> {agent.actif ? "Oui" : "Non"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button className="text-blue-600 hover:underline" onClick={() => setEditing((s) => !s)}>
            {editing ? "Annuler" : "Modifier"}
          </button>
          <button className="text-red-600 hover:underline" onClick={del}>Supprimer</button>
        </div>
      </div>

      {editing && (
        <>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input className="p-2 border rounded" value={local.description} placeholder="Description" onChange={(e) => onField("description", e.target.value)} />
            <select className="p-2 border rounded" value={local.type_agent} onChange={(e) => onField("type_agent", e.target.value)}>
              <option value="trad">trad</option>
              <option value="llm">llm</option>
            </select>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!local.actif} onChange={(e) => onField("actif", e.target.checked)} /> Actif
            </label>
          </div>

          <PromptEditor
            prompts={local.questions_reponses || []}
            onChange={(idx, field, value) => {
              const copy = [...(local.questions_reponses || [])];
              copy[idx] = { ...(copy[idx] || {}), [field]: value };
              setLocal((p) => ({ ...p, questions_reponses: copy }));
            }}
            onAdd={() => setLocal((p) => ({ ...p, questions_reponses: [...(p.questions_reponses || []), { question: "", reponse: "" }] }))}
            onRemove={(idx) => {
              const copy = [...(local.questions_reponses || [])];
              copy.splice(idx, 1);
              setLocal((p) => ({ ...p, questions_reponses: copy }));
            }}
          />

          <div className="mt-3 flex gap-2">
            <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={save}>Enregistrer</button>
            <button className="bg-gray-300 px-3 py-2 rounded" onClick={() => setEditing(false)}>Annuler</button>
          </div>
        </>
      )}

      {!editing && (agent.questions_reponses || []).length > 0 && (
        <div className="mt-3">
          <h4 className="font-semibold">Questions / Réponses</h4>
          <ul className="list-disc pl-5 mt-2 text-sm">
            {agent.questions_reponses.map((q, idx) => (
              <li key={q.id ?? idx}><strong>{q.question}</strong> → {q.reponse}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
