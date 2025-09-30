import React, { createContext, useContext, useState, useEffect } from "react";
import agentsService from "../services/agentsService";

const AgentsContext = createContext();

export function AgentsProvider({ children }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Charger les agents au montage et ne pas recharger inutilement
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await agentsService.getAgents();
      setAgents(list);
    } catch (err) {
      console.error("Erreur fetchAgents:", err);
      setError("Impossible de charger les agents.");
    } finally {
      setLoading(false);
    }
  };

  const addAgent = async (agent) => {
    setLoading(true);
    try {
      const newAgent = await agentsService.createAgent(agent);
      setAgents((prev) => [...prev, newAgent]);
    } catch (err) {
      console.error("Erreur addAgent:", err);
      setError("Impossible de créer l'agent.");
    } finally {
      setLoading(false);
    }
  };

  const updateAgent = async (id, updatedAgent) => {
    setLoading(true);
    try {
      const saved = await agentsService.updateAgent(id, updatedAgent);
      setAgents((prev) => prev.map((a) => (a.id === id ? saved : a)));
    } catch (err) {
      console.error("Erreur updateAgent:", err);
      setError("Impossible de mettre à jour l'agent.");
    } finally {
      setLoading(false);
    }
  };

  const removeAgent = async (id) => {
    setLoading(true);
    try {
      await agentsService.deleteAgent(id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Erreur removeAgent:", err);
      setError("Impossible de supprimer l'agent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AgentsContext.Provider
      value={{
        agents,
        loading,
        error,
        fetchAgents,
        addAgent,
        updateAgent,
        removeAgent,
      }}
    >
      {children}
    </AgentsContext.Provider>
  );
}

export const useAgents = () => useContext(AgentsContext);
