import { useAgents as useAgentsContext } from "../context/AgentsContext";

// Hook simple pour réutiliser le contexte Agents
export const useAgents = () => {
  const context = useAgentsContext();
  if (!context) throw new Error("useAgents doit être utilisé à l'intérieur d'un AgentsProvider");
  return context;
};
