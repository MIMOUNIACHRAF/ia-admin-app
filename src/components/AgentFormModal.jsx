import React, { useState } from "react";
import PromptEditor from "./PromptEditor";

export default function AgentFormModal({ onClose, onSave, initialData }) {
  const [nom, setNom] = useState(initialData?.nom || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type_agent, setTypeAgent] = useState(initialData?.type_agent || "trad");
  const [actif, setActif] = useState(initialData?.actif ?? true);
  const [questions_reponses, setQuestionsReponses] = useState(initialData?.questions_reponses || []);

  const handleSave = () => {
    if (!nom.trim()) return alert("Nom requis");
    onSave({ nom, description, type_agent, actif, questions_reponses });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">{initialData ? "Modifier" : "Créer"} un agent</h2>

        <input
          className="w-full p-2 border rounded mb-2"
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded mb-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          className="w-full p-2 border rounded mb-2"
          value={type_agent}
          onChange={(e) => setTypeAgent(e.target.value)}
        >
          <option value="trad">Traditionnel</option>
          <option value="llm">LLM</option>
        </select>
        <label className="flex items-center gap-2 mb-2">
          <input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} />
          Actif
        </label>

        <PromptEditor prompts={questions_reponses} onChange={(idx, field, value) => {
          const copy = [...questions_reponses];
          copy[idx] = { ...(copy[idx] || {}), [field]: value };
          setQuestionsReponses(copy);
        }} onAdd={() => setQuestionsReponses([...questions_reponses, { question: "", reponse: "" }])} onRemove={(idx) => {
          const copy = [...questions_reponses];
          copy.splice(idx, 1);
          setQuestionsReponses(copy);
        }} />

        <div className="mt-4 flex justify-end gap-2">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>Annuler</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSave}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
