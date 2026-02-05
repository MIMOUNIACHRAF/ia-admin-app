import React, { useState, useCallback } from "react";
import api from "../../api/axiosInstance";

// Composant réutilisable pour chaque correspondance/question
const MatchCard = ({ match, highlight = false, onSelect }) => (
  <div
    className={`p-4 border rounded-lg shadow-sm transition flex justify-between items-start ${
      highlight ? "border-l-4 border-blue-600 bg-blue-50" : "bg-white hover:bg-gray-100"
    }`}
  >
    <div>
      {match.question && <p className="text-gray-700"><strong>Question :</strong> {match.question}</p>}
      {match.reponse && <p className="text-gray-700"><strong>Réponse :</strong> {match.reponse}</p>}
      {match.score !== undefined && (
        <p className="text-gray-500 text-sm"><strong>Score :</strong> {match.score}</p>
      )}
      {match.source && (
        <p className="text-gray-400 text-sm"><strong>Source :</strong> {match.source}</p>
      )}
    </div>
    {onSelect && (
      <button
        onClick={() => onSelect(match)}
        className="ml-4 px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
      >
        ✅ Choisir
      </button>
    )}
  </div>
);
const Matchaltrenative = ({ match, highlight = false, onSelect }) => (
  <div
    className={`p-4 border rounded-lg shadow-sm transition flex justify-between items-start ${
      highlight ? "border-l-4 border-blue-600 bg-blue-50" : "bg-white hover:bg-gray-100"
    }`}
  >
    <div>
      {match.question && <p className="text-gray-700"><strong>Question :</strong> {match.question}</p>}
      {match.reponse && <p className="text-gray-700"><strong>Réponse :</strong> {match.reponse}</p>}
      {match.score !== undefined && (
        <p className="text-gray-500 text-sm"><strong>Score :</strong> {match.score}</p>
      )}
      {match.source && (
        <p className="text-gray-400 text-sm"><strong>Source :</strong> {match.source}</p>
      )}
    </div>
    {onSelect && (
      <button
        onClick={() => onSelect(match)}
        className="ml-4 px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
      >
        ✅ Choisir
      </button>
    )}
  </div>
);

export default function AgentMatch({ agent }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Fonction pour tester l'agent
  const handleMatch = useCallback(async (questionText) => {
    const q = (questionText || "").toString().trim();
    if (!q) return null;

    setLoading(true);
    try {
      const res = await api.get("http://localhost:8000/api/ask/", { params: { question: q } });
      setLoading(false);
      return res.data || {};
    } catch (err) {
      setLoading(false);
      console.error(err.response?.data || err.message);
      return { error: "Erreur lors du test de l'agent." };
    }
  }, []);

  // Soumettre la question
  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = (question || "").toString().trim();
    if (!q) return;
    setSelectedAnswer(null); // réinitialiser sélection
    const res = await handleMatch(q);
    setResult(res);
  };

  const handleReset = () => {
    setQuestion("");
    setResult(null);
    setSelectedAnswer(null);
  };

  // Sélection de la meilleure réponse
  const handleSelectAnswer = (match) => {
    setSelectedAnswer(match);
  };

  // Rechercher une option de clarification
  const handleSelectOption = async (opt) => {
    setQuestion(opt.question);
    setResult(null);
    const res = await handleMatch(opt.question);
    setResult(res);
  };

  return (
    <div className="border rounded-xl shadow-md p-4 bg-white space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Tester l'agent</h3>

      {/* Formulaire */}
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
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
        >
          Annuler
        </button>
      </form>

      {/* Résultats */}
      {result && (
        <div className="space-y-4 animate-fadeIn">
          {/* Erreur */}
          {result.error && (
            <p className="text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">{result.error}</p>
          )}

          {/* Fallback / LLM */}
          {result.source === "llm" && result.message && (
            <p className="italic text-gray-600 bg-yellow-50 border border-yellow-300 rounded-lg p-3">
              🤖 {result.message}
            </p>
          )}

          {/* Clarification */}
          {result.options?.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 shadow-sm space-y-2">
              <h4 className="text-md font-semibold text-gray-700 mb-2">
                ⚠️ Votre question est ambiguë. Cliquez sur une option pour relancer :
              </h4>
              <div className="flex flex-col gap-2">
                {result.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    className="text-left px-3 py-2 rounded-lg bg-yellow-100 hover:bg-yellow-200 border"
                  >
                    {opt.question} (score: {opt.score})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Meilleure correspondance */}
          {result.best_match && (
            <div>
              <h4 className="text-lg font-semibold text-blue-700 mb-2">🏆 Meilleure correspondance</h4>
              <MatchCard match={result.best_match} highlight onSelect={handleSelectAnswer} />
            </div>
          )}

          {/* Alternatives */}
          {result.alternatives?.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-4 shadow-sm">
              <h4 className="text-md font-semibold text-gray-700 mb-2">
                🔍 Autres réponses similaires
              </h4>
              <div className="space-y-2">
                {result.alternatives.map((alt, i) => (
                  <MatchCard key={i} match={alt} onSelect={handleSelectAnswer} />
                ))}
              </div>
            </div>
          )}

          {/* Aucun résultat */}
          {!result.best_match && !result.alternatives?.length && !result.error && !result.options && result.source !== "llm" && (
            <p className="italic text-gray-600 bg-yellow-50 border border-yellow-300 rounded-lg p-3">
              🤖 Aucun match trouvé.
            </p>
          )}

          {/* Réponse sélectionnée */}
          {selectedAnswer && (
            <div className="mt-4 p-4 bg-green-50 border border-green-300 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">✅ Réponse sélectionnée</h4>
              <Matchaltrenative match={selectedAnswer} highlight />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
