import React, { createContext, useContext, useEffect, useState } from "react";
import agentsService from "../services/agentsService";

const AgentsContext = createContext();

export function AgentsProvider({ children }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les agents au montage
  useEffect(() => {
    agentsService.fetchAll().then(setAgents).finally(() => setLoading(false));
  }, []);

  const addAgent = async (agent) => {
    const newAgent = await agentsService.create(agent);
    setAgents((prev) => [...prev, newAgent]);
  };

  const removeAgent = async (id) => {
    await agentsService.remove(id);
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAgentPrompts = async (id, prompts) => {
    const agent = agents.find((a) => a.id === id);
    if (!agent) return;

    const updated = { ...agent, prompts };
    const saved = await agentsService.update(id, updated);

    setAgents((prev) => prev.map((a) => (a.id === id ? saved : a)));
  };

  return (
    <AgentsContext.Provider value={{ agents, loading, addAgent, removeAgent, updateAgentPrompts }}>
      {children}
    </AgentsContext.Provider>
  );
}

export const useAgents = () => useContext(AgentsContext);
