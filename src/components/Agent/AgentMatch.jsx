import React, { useState } from "react";

export default function AgentMatch({ agent, onMatch, loading }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    const res = await onMatch(agent.id, question);
    setResult(res);
    setIsLoading(false);
  };

  return (
    <div className="border rounded-xl shadow-md p-4 bg-white space-y-3">
      <h3 className="text-lg font-semibold text-gray-700">Tester l'agent</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Posez votre question..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSubmit}
          className={`px-4 py-2 rounded-lg text-white font-semibold transition 
            ${isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          disabled={isLoading}
        >
          {isLoading ? "Chargement..." : "Tester"}
        </button>
      </div>

      {result && (
        <div className="mt-3 border rounded-lg p-3 bg-gray-50 shadow-sm animate-fadeIn">
          <p className="text-sm text-gray-500 mb-1"><strong>Source:</strong> {result.source}</p>
          {result.matched_question && (
            <>
              <p className="text-gray-700"><strong>Question:</strong> {result.matched_question}</p>
              <p className="text-gray-700"><strong>Réponse:</strong> {result.response}</p>
              <p className="text-gray-500 text-sm"><strong>Score:</strong> {result.score}</p>
            </>
          )}
          {!result.matched_question && (
            <p className="text-gray-700 italic">{result.detail}</p>
          )}
        </div>
      )}
    </div>
  );
}
