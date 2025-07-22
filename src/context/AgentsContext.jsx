import React, { createContext, useContext, useEffect, useState } from "react";
import { initialAgents } from "../data/agents";

const AgentsContext = createContext();

export function AgentsProvider({ children }) {
  const [agents, setAgents] = useState(() => {
    const saved = localStorage.getItem("agents");
    return saved ? JSON.parse(saved) : initialAgents;
  });

  useEffect(() => {
    localStorage.setItem("agents", JSON.stringify(agents));
  }, [agents]);

  const addAgent = (agent) => {
    const prompts = agent.prompts || [];
    setAgents((prev) => [...prev, { ...agent, id: Date.now(), prompts }]);
  };

  const removeAgent = (id) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAgentPrompts = (id, prompts) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id ? { ...agent, prompts } : agent
      )
    );
  };

  return (
    <AgentsContext.Provider value={{ agents, addAgent, removeAgent, updateAgentPrompts }}>
      {children}
    </AgentsContext.Provider>
  );
}

export function useAgents() {
  return useContext(AgentsContext);
}
