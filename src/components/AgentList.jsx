// components/AgentList.jsx
import React from "react";
import AgentItem from "./AgentItem";

export default function AgentList({
  agents,
  selectedAgentId,
  togglePrompts,
  removeAgent,
  handlePromptChange,
  handleAddPrompt,
}) {
  if (agents.length === 0) {
    return <li className="py-4 text-center text-gray-500">Aucun agent pour l'instant.</li>;
  }
  return (
    <>
      {agents.map((agent) => (
        <AgentItem
          key={agent.id}
          agent={agent}
          isSelected={selectedAgentId === agent.id}
          onToggleConfig={togglePrompts}
          onRemove={removeAgent}
          onChangePrompt={handlePromptChange}
          onAddPrompt={handleAddPrompt}
        />
      ))}
    </>
  );
}
