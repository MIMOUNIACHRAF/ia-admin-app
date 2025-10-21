import React, { useState } from "react";

// Composant réutilisable pour afficher une correspondance/question
const MatchCard = ({ match, highlight = false }) => (
  <div
    className={`p-4 border rounded-lg shadow-sm transition ${
      highlight ? "border-l-4 border-blue-600 bg-blue-50" : "bg-white hover:bg-gray-100"
    }`}
  >
    <p className="text-gray-700"><strong>Question :</strong> {match.question}</p>
    <p className="text-gray-700"><strong>Réponse :</strong> {match.reponse}</p>
    {match.score !== undefined && (
      <p className="text-gray-500 text-sm"><strong>Score :</strong> {match.score}</p>
    )}
    {match.source && (
      <p className="text-gray-400 text-sm"><strong>Source :</strong> {match.source}</p>
    )}
  </div>
);

export default function AgentMatch({ agent, onMatch }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    const res = await onMatch(agent.id, question);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="border rounded-xl shadow-md p-4 bg-white space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Tester l'agent</h3>

      {/* Formulaire question */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Posez votre question..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
            loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Chargement..." : "Tester"}
        </button>
      </form>

      {/* Résultats */}
      {result && (
        <div className="space-y-4 animate-fadeIn">

          {/* 🏆 Meilleure correspondance */}
          {result.best_match && (
            <div>
              <h4 className="text-lg font-semibold text-blue-700 mb-2">🏆 Meilleure correspondance</h4>
              <MatchCard match={result.best_match} highlight />
            </div>
          )}

          {/* 🔍 Alternatives */}
          {result.alternatives?.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
              <h4 className="text-md font-semibold text-gray-700 mb-2">🔍 Autres réponses similaires</h4>
              <div className="space-y-2">
                {result.alternatives.map((alt, i) => (
                  <MatchCard key={i} match={alt} />
                ))}
              </div>
            </div>
          )}

          {/* 🧠 Aucun résultat */}
          {!result.best_match && !result.alternatives?.length && (
            <p className="italic text-gray-600 bg-yellow-50 border border-yellow-300 rounded-lg p-3">
              🤖 Aucun match trouvé, passage au moteur LLM...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
