import React, { useEffect, useState } from "react";
import { useAgents } from "../context/AgentsContext";

export default function AgentsPage() {
  const { agents, loading, fetchAgents, addAgent, removeAgent } = useAgents();
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");

  // ⚡ Charger la liste des agents uniquement au montage de la page
  useEffect(() => {
    fetchAgents();
  }, []); // [] = seulement au premier rendu

  const onCreate = async () => {
    if (!nom.trim()) return alert("Nom requis");
    await addAgent({
      nom: nom.trim(),
      description: description.trim(),
      type_agent: "trad",
      actif: true,
      questions_reponses: [],
    });
    setNom("");
    setDescription("");
  };

  const onDelete = async (id) => {
    if (window.confirm("Supprimer cet agent ?")) {
      await removeAgent(id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des agents</h1>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Créer un agent</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            className="p-2 border rounded"
            placeholder="Nom de l'agent"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
          <input
            className="p-2 border rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={onCreate}>
              Créer
            </button>
            <button
              className="bg-gray-200 px-3 py-2 rounded"
              onClick={() => { setNom(""); setDescription(""); }}
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Liste des agents</h2>
        {loading && <p>Chargement...</p>}
        {!loading && agents.length === 0 && <p>Aucun agent trouvé.</p>}
        <ul>
          {agents.map((a) => (
            <li key={a.id} className="border-b py-2 flex justify-between items-center">
              <div>
                <strong>{a.nom}</strong> - {a.description}
              </div>
              <button className="text-red-600" onClick={() => onDelete(a.id)}>
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
