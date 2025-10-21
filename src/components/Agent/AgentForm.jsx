import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export default function AgentForm({ onSubmit, initialData, templates, onCancel }) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [typeAgent, setTypeAgent] = useState("trad");
  const [templateIds, setTemplateIds] = useState([]);

  // Initialisation du formulaire
  useEffect(() => {
    if (initialData) {
      setNom(initialData.nom || "");
      setDescription(initialData.description || "");
      setTypeAgent(initialData.type_agent || "trad");
      setTemplateIds(
        initialData.templates?.map(t => (typeof t === "object" ? t.id : t)) || []
      );
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setNom("");
    setDescription("");
    setTypeAgent("trad");
    setTemplateIds([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nom.trim()) return toast.error("Le nom de l'agent est requis");
    onSubmit({ nom, description, type_agent: typeAgent, template_ids: templateIds });
    resetForm();
  };

  const toggleTemplate = useCallback(
    (id) => {
      setTemplateIds(prev =>
        prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
      );
    },
    [setTemplateIds]
  );

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded space-y-4 bg-gray-50">
      <div className="flex flex-col space-y-1">
        <label className="font-medium">Nom *</label>
        <input
          type="text"
          value={nom}
          onChange={e => setNom(e.target.value)}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-medium">Description</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-medium">Type d'agent</label>
        <select
          value={typeAgent}
          onChange={e => setTypeAgent(e.target.value)}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        >
          <option value="trad">Traditionnel</option>
          <option value="ia">IA</option>
        </select>
      </div>

      {templates?.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
    
    {/* Templates assignés */}
    <div className="bg-white border rounded-xl shadow-sm p-3">
      <h4 className="font-semibold text-gray-700 mb-2">✅ Assignés</h4>
      {templateIds.filter(id => templates.find(t => t.id === id)).length === 0 ? (
        <p className="text-gray-500 italic">Aucun template assigné</p>
      ) : (
        templateIds
          .map(id => templates.find(t => t.id === id))
          .filter(Boolean)
          .map(t => (
            <div key={t.id} className="flex justify-between items-center p-1 border-b last:border-none">
              <span>{t.nom}</span>
              <button
                type="button"
                onClick={() => toggleTemplate(t.id)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Retirer
              </button>
            </div>
          ))
      )}
    </div>

    {/* Templates disponibles */}
    <div className="bg-white border rounded-xl shadow-sm p-3">
      <h4 className="font-semibold text-gray-700 mb-2">🟢 Disponibles</h4>
      {templates
        .filter(t => !templateIds.includes(t.id))
        .map(t => (
          <div key={t.id} className="flex justify-between items-center p-1 border-b last:border-none">
            <span>{t.nom}</span>
            <button
              type="button"
              onClick={() => toggleTemplate(t.id)}
              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Assigner
            </button>
          </div>
        ))}
      {templates.filter(t => !templateIds.includes(t.id)).length === 0 && (
        <p className="text-gray-500 italic">Tous les templates sont assignés</p>
      )}
    </div>

  </div>
)}


      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {initialData ? "Modifier" : "Créer"}
        </button>
        {initialData && (
          <button
            type="button"
            onClick={() => { resetForm(); onCancel?.(); }}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
