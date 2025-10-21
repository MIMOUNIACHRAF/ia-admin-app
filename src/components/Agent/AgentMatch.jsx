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
  <div className="mt-4 space-y-4 animate-fadeIn">
    {/* 🏆 Meilleure correspondance */}
    {result.best_match && (
      <div className="border-l-4 border-blue-600 bg-blue-50 p-4 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold text-blue-700">🏆 Meilleure correspondance</h4>
        <p className="text-gray-700 mt-1"><strong>Question :</strong> {result.best_match.question}</p>
        <p className="text-gray-700"><strong>Réponse :</strong> {result.best_match.reponse}</p>
        <p className="text-gray-500 text-sm"><strong>Score :</strong> {result.best_match.score}</p>
      </div>
    )}

    {/* 🔍 Autres suggestions */}
    {result.other_matches && result.other_matches.length > 0 && (
      <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
        <h4 className="text-md font-semibold text-gray-700 mb-2">🔍 Autres réponses similaires</h4>
        <div className="space-y-2">
          {result.other_matches.map((m, i) => (
            <div
              key={i}
              className="p-3 border rounded-lg bg-white hover:bg-gray-100 transition"
            >
              <p className="text-gray-700"><strong>Question :</strong> {m.question}</p>
              <p className="text-gray-700"><strong>Réponse :</strong> {m.reponse}</p>
              <p className="text-gray-500 text-sm"><strong>Score :</strong> {m.score}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* 🧠 Aucun résultat */}
    {!result.best_match && !result.other_matches?.length && (
      <p className="italic text-gray-600 bg-yellow-50 border border-yellow-300 rounded-lg p-3">
        🤖 Aucun match trouvé, passage au moteur LLM...
      </p>
    )}
  </div>
)}

    </div>
  );
}
