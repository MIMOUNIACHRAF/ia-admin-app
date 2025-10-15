import React, { useState } from "react";

export default function AgentMatch({ agent, onMatch }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);

  const handleMatch = async () => {
    const res = await onMatch(agent.id, question);
    setResult(res);
  };

  return (
    <div className="border p-3 rounded space-y-2">
      <input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Posez votre question" className="w-full border px-3 py-2 rounded" />
      <button onClick={handleMatch} className="bg-blue-500 text-white px-4 py-2 rounded">Tester</button>
      {result && (
        <div className="mt-2 p-2 border rounded bg-gray-50">
          <p><strong>Source:</strong> {result.source}</p>
          <p><strong>Question:</strong> {result.matched_question}</p>
          <p><strong>Réponse:</strong> {result.response}</p>
          <p><strong>Score:</strong> {result.score}</p>
        </div>
      )}
    </div>
  );
}
