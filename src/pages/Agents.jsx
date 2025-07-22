import React, { useState } from "react";
import { useAgents } from "../context/AgentsContext";

export default function Agents() {
  const { agents, addAgent, removeAgent, updateAgentPrompts } = useAgents();
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [error, setError] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  const handleAdd = () => {
    if (!newName.trim() || !newRole.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    addAgent({ name: newName.trim(), role: newRole.trim(), prompts: [] });
    setNewName("");
    setNewRole("");
    setError("");
  };

  const togglePrompts = (agentId) => {
    setSelectedAgentId((prev) => (prev === agentId ? null : agentId));
  };

  const handlePromptChange = (agentId, index, field, value) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const updatedPrompts = [...agent.prompts];
    updatedPrompts[index][field] = value;
    updateAgentPrompts(agentId, updatedPrompts);
  };

  const handleAddPrompt = (agentId) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const updatedPrompts = [...(agent.prompts || []), { question: "", answer: "" }];
    updateAgentPrompts(agentId, updatedPrompts);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900">Liste des Agents</h1>

      <ul className="divide-y divide-gray-200 mb-8">
        {agents.length === 0 && (
          <li className="py-4 text-center text-gray-500">Aucun agent pour l'instant.</li>
        )}
        {agents.map((agent) => (
          <li key={agent.id} className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-gray-800">{agent.name}</p>
                <p className="text-sm text-gray-500">{agent.role}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePrompts(agent.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {selectedAgentId === agent.id ? "Masquer" : "Configurer"}
                </button>
                <button
                  onClick={() => removeAgent(agent.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </div>
            </div>

            {selectedAgentId === agent.id && (
              <div className="mt-4 bg-gray-100 p-4 rounded">
                <h3 className="text-md font-bold mb-2">Prompts par défaut</h3>
                {agent.prompts?.map((prompt, index) => (
                  <div key={index} className="mb-4">
                    <input
                      type="text"
                      placeholder="Question"
                      value={prompt.question}
                      onChange={(e) =>
                        handlePromptChange(agent.id, index, "question", e.target.value)
                      }
                      className="w-full mb-2 p-2 border border-gray-300 rounded"
                    />
                    <input
                      type="text"
                      placeholder="Réponse"
                      value={prompt.answer}
                      onChange={(e) =>
                        handlePromptChange(agent.id, index, "answer", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                ))}
                <button
                  onClick={() => handleAddPrompt(agent.id)}
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Ajouter un prompt
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Nom de l'agent"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Rôle"
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white rounded-md px-6 py-3 font-semibold hover:bg-blue-700 transition"
        >
          Ajouter
        </button>
      </div>

      {error && (
        <p className="mt-4 text-red-600 font-medium text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
