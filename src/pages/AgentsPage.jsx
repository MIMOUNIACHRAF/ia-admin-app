// src/pages/AgentsPage.jsx
import React, { useState, useEffect } from "react";
import { useAgents } from "../hooks/useAgents";
import AgentList from "../components/AgentList";
import AgentFormModal from "../components/AgentFormModal";

export default function AgentsPage() {
  const { agents, loading, error, fetchAgents, addAgent } = useAgents();
  const [showModal, setShowModal] = useState(false);

  // ⚡ fetch uniquement quand cette page est montée
  useEffect(() => {
    fetchAgents();
  }, []); // [] = au premier rendu

  const handleCreate = async (data) => {
    await addAgent(data);
    setShowModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des agents IA</h1>

      <div className="mb-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowModal(true)}
        >
          Créer un agent
        </button>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <AgentList agents={agents} />

      {showModal && <AgentFormModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
    </div>
  );
}
