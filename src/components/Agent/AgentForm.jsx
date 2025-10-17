import React, { useState, useEffect } from "react";

export default function AgentForm({ onSubmit, initialData, templates }) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [typeAgent, setTypeAgent] = useState("trad");
  const [templateIds, setTemplateIds] = useState([]);

  useEffect(() => {
    if (initialData) {
      setNom(initialData.nom || "");
      setDescription(initialData.description || "");
      setTypeAgent(initialData.type_agent || "trad");
      setTemplateIds(
        initialData.templates?.map(t => (typeof t === "object" ? t.id : t)) || []
      );
    } else {
      setNom("");
      setDescription("");
      setTypeAgent("trad");
      setTemplateIds([]);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nom, description, type_agent: typeAgent, template_ids: templateIds });
  };

  const toggleTemplate = (id) => {
    setTemplateIds(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded space-y-2">
      <input
        type="text"
        placeholder="Nom"
        value={nom}
        onChange={e => setNom(e.target.value)}
        className="border p-1 rounded w-full"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="border p-1 rounded w-full"
      />
      <select
        value={typeAgent}
        onChange={e => setTypeAgent(e.target.value)}
        className="border p-1 rounded w-full"
      >
        <option value="trad">Traditionnel</option>
        <option value="ia">IA</option>
      </select>

      {templates?.length > 0 && (
        <div className="space-y-1">
          <p className="font-bold">Templates assignés :</p>
          {templates.map(t => (
            <label key={t.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={templateIds.includes(t.id)}
                onChange={() => toggleTemplate(t.id)}
              />
              <span>{t.nom}</span>
            </label>
          ))}
        </div>
      )}

      <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
        {initialData ? "Modifier" : "Créer"}
      </button>
    </form>
  );
}
