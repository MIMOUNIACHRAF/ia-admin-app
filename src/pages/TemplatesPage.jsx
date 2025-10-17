import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  importTemplateQuestions
} from "../features/templates/templatesSlice";

import {
  fetchQuestionsByTemplate,
  createQuestion,
  updateQuestion,
  deleteQuestion
} from "../features/questions/questionsSlice";

import Loader from "../components/common/Loader";

export default function TemplatesPage() {
  const dispatch = useDispatch();

  const { list: templates = [], loading: templatesLoading, error: templatesError } = useSelector(
    (state) => state.templates || {}
  );

  const { list: questions = [], loading: questionsLoading, error: questionsError } = useSelector(
    (state) => state.questions || {}
  );

  // Template form
  const [templateData, setTemplateData] = useState({ nom: "", description: "" });
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [jsonData, setJsonData] = useState(""); // pour import JSON questions

  // Question form
  const [questionData, setQuestionData] = useState({ question: "", reponse: "", ordre: 1 });
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Load templates au montage
  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  // Load questions pour le template sélectionné
  useEffect(() => {
    if (editingTemplate) {
      dispatch(fetchQuestionsByTemplate({ templateId: editingTemplate.id }));
    }
  }, [editingTemplate, dispatch]);

  // --- TEMPLATE CRUD ---
  const handleSubmitTemplate = async (e) => {
    e.preventDefault();
    if (!templateData.nom.trim()) return alert("Nom requis");

    if (editingTemplate) {
      await dispatch(updateTemplate({ id: editingTemplate.id, data: templateData }));
      setEditingTemplate(null);
    } else {
      await dispatch(createTemplate(templateData));
    }
    setTemplateData({ nom: "", description: "" });
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateData({ nom: template.nom, description: template.description });
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm("Supprimer ce template ?")) {
      await dispatch(deleteTemplate(id));
      if (editingTemplate && editingTemplate.id === id) setEditingTemplate(null);
    }
  };

  // --- IMPORT JSON QUESTIONS ---
  const handleImport = async () => {
    if (!editingTemplate) return alert("Sélectionnez un template pour importer");
    let questionsJson;
    try {
      questionsJson = JSON.parse(jsonData);
      if (!Array.isArray(questionsJson)) throw new Error("JSON doit être un tableau");
    } catch (err) {
      return alert("JSON invalide : " + err.message);
    }

    await dispatch(importTemplateQuestions({ templateId: editingTemplate.id, questions: questionsJson }));
    alert("Questions importées !");
    setJsonData("");
    dispatch(fetchQuestionsByTemplate({ templateId: editingTemplate.id }));
  };

  // --- QUESTION CRUD ---
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!editingTemplate) return alert("Sélectionnez un template");
    if (!questionData.question.trim()) return alert("Question requise");

    const payload = { ...questionData, template: editingTemplate.id };

    if (editingQuestion) {
      await dispatch(updateQuestion({ id: editingQuestion.id, data: payload }));
      setEditingQuestion(null);
    } else {
      await dispatch(createQuestion(payload));
    }
    setQuestionData({ question: "", reponse: "", ordre: 1 });
    dispatch(fetchQuestionsByTemplate({ templateId: editingTemplate.id }));
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionData({ question: q.question, reponse: q.reponse, ordre: q.ordre });
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Supprimer cette question ?")) {
      await dispatch(deleteQuestion(id));
      dispatch(fetchQuestionsByTemplate({ templateId: editingTemplate.id }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">📋 Gestion des Templates et Questions</h2>

      {/* --- TEMPLATE FORM --- */}
      <form
        onSubmit={handleSubmitTemplate}
        className="bg-gray-100 p-4 rounded-lg flex flex-col gap-3 max-w-md"
      >
        <input
          type="text"
          placeholder="Nom du template"
          value={templateData.nom}
          onChange={(e) => setTemplateData({ ...templateData, nom: e.target.value })}
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Description"
          value={templateData.description}
          onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingTemplate ? "Modifier Template" : "Ajouter Template"}
        </button>
      </form>

      {/* --- TEMPLATE LIST --- */}
      <div className="space-y-3">
        {templatesLoading && <Loader />}
        {templatesError && <p className="text-red-600">{String(templatesError)}</p>}
        {templates.map((t) => (
          <div
            key={t.id}
            className={`flex justify-between items-center p-3 rounded shadow ${
              editingTemplate?.id === t.id ? "bg-yellow-50" : "bg-white"
            }`}
          >
            <div>
              <h3 className="font-semibold">{t.nom}</h3>
              <p className="text-gray-600 text-sm">{t.description}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEditTemplate(t)} className="text-blue-600 hover:underline">✏️</button>
              <button onClick={() => handleDeleteTemplate(t.id)} className="text-red-600 hover:underline">🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* --- IMPORT JSON QUESTIONS --- */}
      {editingTemplate && (
        <div className="bg-gray-50 p-4 rounded max-w-md">
          <h3 className="font-semibold mb-2">Importer JSON Questions/Réponses</h3>
          <textarea
            placeholder='Ex: [{"question":"Q1","reponse":"R1","ordre":1}]'
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            className="border p-2 rounded w-full h-32"
          />
          <button onClick={handleImport} className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Importer JSON
          </button>
        </div>
      )}

      {/* --- QUESTION CRUD --- */}
      {editingTemplate && (
        <div className="mt-6 max-w-md">
          <h3 className="font-semibold mb-2">Questions du template : {editingTemplate.nom}</h3>

          <form onSubmit={handleSubmitQuestion} className="flex flex-col gap-2 mb-4">
            <input
              placeholder="Question"
              value={questionData.question}
              onChange={(e) => setQuestionData({ ...questionData, question: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              placeholder="Réponse"
              value={questionData.reponse}
              onChange={(e) => setQuestionData({ ...questionData, reponse: e.target.value })}
              className="border p-2 rounded"
            />
            <input
              type="number"
              value={questionData.ordre}
              onChange={(e) => setQuestionData({ ...questionData, ordre: Number(e.target.value) })}
              className="border p-2 rounded"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              {editingQuestion ? "Modifier Question" : "Ajouter Question"}
            </button>
          </form>

          {questionsLoading && <p>Chargement questions...</p>}
          {questionsError && <p className="text-red-600">{String(questionsError)}</p>}

          <ul>
            {questions.map((q) => (
              <li key={q.id} className="flex justify-between items-center p-2 border-b">
                <span>{q.ordre}. {q.question} → {q.reponse}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEditQuestion(q)} className="text-blue-600 hover:underline">✏️</button>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-600 hover:underline">🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
