// components/PromptEditor.jsx
import React from "react";

export default function PromptEditor({ prompts, onChangePrompt, onAddPrompt }) {
  return (
    <div className="mt-4 bg-gray-100 p-4 rounded">
      <h3 className="text-md font-bold mb-2">Prompts par défaut</h3>
      {prompts.map((prompt, index) => (
        <div key={index} className="mb-4">
          <input
            type="text"
            placeholder="Question"
            value={prompt.question}
            onChange={(e) => onChangePrompt(index, "question", e.target.value)}
            className="w-full mb-2 p-2 border border-gray-300 rounded"
            aria-label={`Question du prompt ${index + 1}`}
          />
          <input
            type="text"
            placeholder="Réponse"
            value={prompt.answer}
            onChange={(e) => onChangePrompt(index, "answer", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            aria-label={`Réponse du prompt ${index + 1}`}
          />
        </div>
      ))}
      <button
        onClick={onAddPrompt}
        className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        aria-label="Ajouter un nouveau prompt"
      >
        Ajouter un prompt
      </button>
    </div>
  );
}
