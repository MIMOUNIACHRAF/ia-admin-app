import React, { createContext, useContext, useState } from "react";
import agentsService from "../services/agentsService";

const AgentsContext = createContext();

export function AgentsProvider({ children }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fonction pour récupérer les agents manuellement
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const list = await agentsService.getAgents();
      setAgents(list);
    } catch (err) {
      console.error("Erreur fetchAgents:", err);
    } finally {
      setLoading(false);
    }
  };

  const addAgent = async (agent) => {
    const newAgent = await agentsService.createAgent(agent);
    setAgents((prev) => [...prev, newAgent]);
  };

  const removeAgent = async (id) => {
    await agentsService.deleteAgent(id);
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAgentPrompts = async (id, prompts) => {
    const agent = agents.find((a) => a.id === id);
    if (!agent) return;

    const updated = { ...agent, questions_reponses: prompts };
    const saved = await agentsService.updateAgent(id, updated);
    setAgents((prev) => prev.map((a) => (a.id === id ? saved : a)));
  };

  return (
    <AgentsContext.Provider
      value={{ agents, loading, fetchAgents, addAgent, removeAgent, updateAgentPrompts }}
    >
      {children}
    </AgentsContext.Provider>
  );
}

export const useAgents = () => useContext(AgentsContext);
