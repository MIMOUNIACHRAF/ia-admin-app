import React from "react";
import AgentItem from "./AgentItem";

export default function AgentList({ agents }) {
  if (!agents || agents.length === 0) return <p className="text-gray-500">Aucun agent disponible.</p>;
  return <div>{agents.map((agent) => <AgentItem key={agent.id} agent={agent} />)}</div>;
}
