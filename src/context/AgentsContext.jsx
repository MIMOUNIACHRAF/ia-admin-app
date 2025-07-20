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

  // Exemple: fonction pour ajouter un agent
  const addAgent = (agent) => {
    setAgents((prev) => [...prev, { ...agent, id: Date.now() }]);
  };

  // Exemple: fonction pour supprimer un agent
  const removeAgent = (id) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AgentsContext.Provider value={{ agents, addAgent, removeAgent }}>
      {children}
    </AgentsContext.Provider>
  );
}

export function useAgents() {
  return useContext(AgentsContext);
}
