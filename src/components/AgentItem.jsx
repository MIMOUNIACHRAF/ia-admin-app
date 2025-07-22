// components/AgentItem.jsx
import React from "react";
import PromptEditor from "./PromptEditor";

export default function AgentItem({
  agent,
  isSelected,
  onToggleConfig,
  onRemove,
  onChangePrompt,
  onAddPrompt,
}) {
  return (
    <li className="py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-800">{agent.name}</p>
          <p className="text-sm text-gray-500">{agent.role}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleConfig(agent.id)}
            className="text-blue-600 hover:text-blue-800"
            aria-expanded={isSelected}
            aria-controls={`prompts-${agent.id}`}
          >
            {isSelected ? "Masquer" : "Configurer"}
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Supprimer l’agent ${agent.name} ?`)) onRemove(agent.id);
            }}
            className="text-red-600 hover:text-red-800"
            aria-label={`Supprimer ${agent.name}`}
          >
            Supprimer
          </button>
        </div>
      </div>

      {isSelected && (
        <div id={`prompts-${agent.id}`}>
          <PromptEditor
            prompts={agent.prompts || []}
            onChangePrompt={(index, field, value) => onChangePrompt(agent.id, index, field, value)}
            onAddPrompt={() => onAddPrompt(agent.id)}
          />
        </div>
      )}
    </li>
  );
}
