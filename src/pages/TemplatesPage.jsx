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

  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ nom: "", description: "" });
  const [jsonData, setJsonData] = useState("");

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({ question: "", reponse: "", ordre: 1 });

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  // --- TEMPLATE CRUD ---
  const handleSubmitTemplate = async (e) => {
    e.preventDefault();
    if (!templateForm.nom.trim()) return alert("Nom requis");

    if (editingTemplate) {
      await dispatch(updateTemplate({ id: editingTemplate.id, data: templateForm }));
      setEditingTemplate(null);
    } else {
      await dispatch(createTemplate(templateForm));
    }
    setTemplateForm({ nom: "", description: "" });
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({ nom: template.nom, description: template.description });
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm("Supprimer ce template ?")) {
      await dispatch(deleteTemplate(id));
      if (editingTemplate?.id === id) setEditingTemplate(null);
    }
  };

  // --- QUESTIONS CRUD ---
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!editingTemplate?.id) return alert("Sélectionnez un template");
    if (!questionForm.question.trim()) return alert("Question requise");

    const payload = { templateId: editingTemplate.id, questionData: questionForm };

    if (editingQuestion) {
      await dispatch(updateQuestion({ id: editingQuestion.id, data: payload }));
      setEditingQuestion(null);
    } else {
      await dispatch(createQuestion(payload));
    }

    setQuestionForm({ question: "", reponse: "", ordre: 1 });
    // rafraîchir questions automatiquement en récupérant le template mis à jour
    dispatch(fetchTemplates());
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({ question: q.question, reponse: q.reponse, ordre: q.ordre });
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Supprimer cette question ?")) {
      await dispatch(deleteQuestion(id));
      dispatch(fetchTemplates());
    }
  };

  // --- IMPORT JSON QUESTIONS ---
  const handleImport = async () => {
    if (!editingTemplate?.id) return alert("Sélectionnez un template pour importer");
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
    dispatch(fetchTemplates());
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
          value={templateForm.nom}
          onChange={(e) => setTemplateForm({ ...templateForm, nom: e.target.value })}
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Description"
          value={templateForm.description}
          onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
            className={`p-4 border rounded shadow ${editingTemplate?.id === t.id ? "bg-yellow-50" : "bg-white"}`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{t.nom}</h3>
                <p className="text-gray-600 text-sm">{t.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditTemplate(t)} className="text-blue-600 hover:underline">✏️</button>
                <button onClick={() => handleDeleteTemplate(t.id)} className="text-red-600 hover:underline">🗑️</button>
              </div>
            </div>

            {/* --- QUESTIONS LIST --- */}
            {editingTemplate?.id === t.id && (
              <div className="mt-4 space-y-2">
                <h4 className="font-semibold">Questions</h4>
                {t.questions_reponses?.map((q) => (
                  <div key={q.id} className="flex justify-between items-center p-2 border rounded">
                    <span>{q.ordre}. {q.question} → {q.reponse}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditQuestion(q)} className="text-blue-600 hover:underline">✏️</button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-600 hover:underline">🗑️</button>
                    </div>
                  </div>
                ))}

                {/* --- FORM ADD / EDIT QUESTION --- */}
                <form onSubmit={handleSubmitQuestion} className="flex flex-col gap-2 mt-2">
                  <input
                    placeholder="Question"
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                    className="border p-2 rounded"
                  />
                  <input
                    placeholder="Réponse"
                    value={questionForm.reponse}
                    onChange={(e) => setQuestionForm({ ...questionForm, reponse: e.target.value })}
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    value={questionForm.ordre}
                    onChange={(e) => setQuestionForm({ ...questionForm, ordre: Number(e.target.value) })}
                    className="border p-2 rounded"
                  />
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    {editingQuestion ? "Modifier Question" : "Ajouter Question"}
                  </button>
                </form>

                {/* --- IMPORT JSON --- */}
                <div className="mt-2">
                  <textarea
                    placeholder='Ex: [{"question":"Q1","reponse":"R1","ordre":1}]'
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    className="border p-2 rounded w-full h-24"
                  />
                  <button onClick={handleImport} className="mt-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Importer JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
