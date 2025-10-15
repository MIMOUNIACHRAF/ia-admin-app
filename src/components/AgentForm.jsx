import React, { useState, useEffect } from "react";

export default function AgentForm({ onSubmit, initialData, templates }) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [typeAgent, setTypeAgent] = useState("trad");
  const [selectedTemplates, setSelectedTemplates] = useState([]);

  useEffect(() => {
    if (initialData) {
      setNom(initialData.nom);
      setDescription(initialData.description);
      setTypeAgent(initialData.type_agent);
      setSelectedTemplates(initialData.templates || []);
    }
  }, [initialData]);

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ nom, description, type_agent: typeAgent, templates: selectedTemplates });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom" className="w-full border px-3 py-2 rounded" required />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full border px-3 py-2 rounded" />
      <select value={typeAgent} onChange={e => setTypeAgent(e.target.value)} className="w-full border px-3 py-2 rounded">
        <option value="trad">Agent traditionnel</option>
        <option value="llm">Agent LLM</option>
      </select>
      <div>
        <label>Templates assignés:</label>
        <select multiple value={selectedTemplates} onChange={e => setSelectedTemplates([...e.target.selectedOptions].map(o => o.value))} className="w-full border px-3 py-2 rounded">
          {templates.map(t => (
            <option key={t.id} value={t.id}>{t.nom}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Enregistrer</button>
    </form>
  );
}
