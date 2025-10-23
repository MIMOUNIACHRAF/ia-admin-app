import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AgentQuestions({ agentId, token }) {
  const [questions, setQuestions] = useState([]);
  const [newQ, setNewQ] = useState({ question: "", reponse: "", ordre: 0 });
  const [editingId, setEditingId] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  // Fetch questions liées à l'agent
  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`/api/questionsreponse/?agent=${agentId}`, { headers });
      setQuestions(res.data.results);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Ajouter une question
  const addQuestion = async () => {
    try {
      const res = await axios.post(`/api/agents/${agentId}/add-question/`, newQ, { headers });
      setQuestions([...questions, res.data.data]);
      setNewQ({ question: "", reponse: "", ordre: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  // Modifier une question
  const updateQuestion = async (id, updatedQ) => {
    try {
      const res = await axios.patch(`/api/questionsreponse/${id}/`, updatedQ, { headers });
      setQuestions(questions.map(q => (q.id === id ? res.data : q)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Supprimer une question
  const deleteQuestion = async (id) => {
    try {
      await axios.delete(`/api/questionsreponse/${id}/`, { headers });
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Questions de l'agent</h2>

      <div>
        <input
          placeholder="Question"
          value={newQ.question}
          onChange={e => setNewQ({ ...newQ, question: e.target.value })}
        />
        <input
          placeholder="Réponse"
          value={newQ.reponse}
          onChange={e => setNewQ({ ...newQ, reponse: e.target.value })}
        />
        <input
          type="number"
          placeholder="Ordre"
          value={newQ.ordre}
          onChange={e => setNewQ({ ...newQ, ordre: parseInt(e.target.value) })}
        />
        <button onClick={addQuestion}>Ajouter</button>
      </div>

      <ul>
        {questions.map(q => (
          <li key={q.id}>
            {editingId === q.id ? (
              <>
                <input
                  value={q.question}
                  onChange={e => setQuestions(questions.map(qq => qq.id === q.id ? { ...qq, question: e.target.value } : qq))}
                />
                <input
                  value={q.reponse}
                  onChange={e => setQuestions(questions.map(qq => qq.id === q.id ? { ...qq, reponse: e.target.value } : qq))}
                />
                <button onClick={() => updateQuestion(q.id, { question: q.question, reponse: q.reponse, ordre: q.ordre })}>Sauvegarder</button>
                <button onClick={() => setEditingId(null)}>Annuler</button>
              </>
            ) : (
              <>
                <strong>{q.question}</strong> - {q.reponse} (ordre: {q.ordre})
                <button onClick={() => setEditingId(q.id)}>Modifier</button>
                <button onClick={() => deleteQuestion(q.id)}>Supprimer</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
