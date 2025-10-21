// TemplatesPageModern.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  importTemplateQuestions,
} from "../features/templates/templatesSlice";

import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../features/questions/questionsSlice";

import Loader from "../components/common/Loader";

// --- TEMPLATE FORM COMPONENT ---
function TemplateForm({ templateForm, setTemplateForm, onSubmit, onCancel, editingTemplate }) {
  return (
    <motion.form
      onSubmit={onSubmit}
      className="bg-gray-50 p-6 rounded-2xl shadow-lg max-w-md flex flex-col gap-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <input
        type="text"
        placeholder="Nom du template"
        value={templateForm.nom}
        onChange={(e) => setTemplateForm({ ...templateForm, nom: e.target.value })}
        className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
      />
      <textarea
        placeholder="Description"
        value={templateForm.description}
        onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
        className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-400 transition"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition transform hover:scale-105 active:scale-95 flex-1"
        >
          {editingTemplate ? "Modifier Template" : "Ajouter Template"}
        </button>
        {editingTemplate && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white px-6 py-3 rounded-xl hover:bg-gray-500 transition transform hover:scale-105 active:scale-95 flex-1"
          >
            Annuler
          </button>
        )}
      </div>
    </motion.form>
  );
}

// --- QUESTION FORM COMPONENT ---
function QuestionForm({ questionForm, setQuestionForm, onSubmit, onCancel, editingQuestion }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <input
        placeholder="Question"
        value={questionForm.question}
        onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
        className="border p-3 rounded-xl focus:ring-2 focus:ring-green-400 transition"
      />
      <input
        placeholder="Réponse"
        value={questionForm.reponse}
        onChange={(e) => setQuestionForm({ ...questionForm, reponse: e.target.value })}
        className="border p-3 rounded-xl focus:ring-2 focus:ring-green-400 transition"
      />
      <input
        type="number"
        value={questionForm.ordre}
        onChange={(e) => setQuestionForm({ ...questionForm, ordre: Number(e.target.value) })}
        className="border p-3 rounded-xl focus:ring-2 focus:ring-green-400 transition"
      />
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition transform hover:scale-105 active:scale-95 flex-1"
        >
          {editingQuestion ? "Modifier Question" : "Ajouter Question"}
        </button>
        {editingQuestion && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white px-4 py-2 rounded-xl hover:bg-gray-500 transition transform hover:scale-105 active:scale-95 flex-1"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

// --- TEMPLATE CARD COMPONENT ---
function TemplateCard({
  template,
  editingTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onEditQuestion,
  onDeleteQuestion,
  children,
}) {
  const isEditing = editingTemplate?.id === template.id;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1, backgroundColor: isEditing ? "#FEF9C3" : "#ffffff" }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl shadow-lg p-4 flex flex-col justify-between hover:scale-105 transition cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{template.nom}</h3>
          <p className="text-gray-500 text-sm">{template.description}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEditTemplate(template)} className="text-yellow-500 hover:text-yellow-600">✏️</button>
          <button onClick={() => onDeleteTemplate(template.id)} className="text-red-500 hover:text-red-600">🗑️</button>
        </div>
      </div>

      {isEditing && children}
    </motion.div>
  );
}

// --- MAIN PAGE ---
export default function TemplatesPageModern() {
  const dispatch = useDispatch();
  const { list: templates = [] } = useSelector((state) => state.templates || {});

  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ nom: "", description: "" });
  const [jsonData, setJsonData] = useState("");

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({ question: "", reponse: "", ordre: 1 });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    dispatch(fetchTemplates()).finally(() => setLoading(false));
  }, [dispatch]);

  // --- TEMPLATE HANDLERS ---
  const handleSubmitTemplate = async (e) => {
    e.preventDefault();
    if (!templateForm.nom.trim()) return toast.error("Nom requis");
    try {
      setLoading(true);
      if (editingTemplate) {
        await dispatch(updateTemplate({ id: editingTemplate.id, data: templateForm }));
        toast.success("Template modifié !");
        setEditingTemplate(null);
      } else {
        await dispatch(createTemplate(templateForm));
        toast.success("Template ajouté !");
      }
      setTemplateForm({ nom: "", description: "" });
      dispatch(fetchTemplates());
    } catch (err) {
      toast.error("Erreur Template : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ nom: "", description: "" });
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Supprimer ce template ?")) return;
    try {
      setLoading(true);
      await dispatch(deleteTemplate(id));
      toast.success("Template supprimé !");
      if (editingTemplate?.id === id) handleCancelTemplate();
      dispatch(fetchTemplates());
    } catch (err) {
      toast.error("Erreur suppression : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({ nom: template.nom, description: template.description });
  };

  // --- QUESTION HANDLERS ---
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!editingTemplate?.id) return toast.error("Sélectionnez un template");
    if (!questionForm.question.trim()) return toast.error("Question requise");
    if (!questionForm.reponse.trim()) return toast.error("Réponse requise");

    const payload = { ...questionForm, template: editingTemplate.id };
    try {
      setLoading(true);
      if (editingQuestion) {
        await dispatch(updateQuestion({ id: editingQuestion.id, data: payload }));
        toast.success("Question modifiée !");
        setEditingQuestion(null);
      } else {
        await dispatch(createQuestion(payload));
        toast.success("Question ajoutée !");
      }
      setQuestionForm({ question: "", reponse: "", ordre: 1 });
      dispatch(fetchTemplates());
    } catch (err) {
      toast.error("Erreur Question : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({ question: "", reponse: "", ordre: 1 });
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({ question: q.question, reponse: q.reponse, ordre: q.ordre });
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Supprimer cette question ?")) return;
    try {
      setLoading(true);
      await dispatch(deleteQuestion(id));
      toast.success("Question supprimée !");
      dispatch(fetchTemplates());
    } catch (err) {
      toast.error("Erreur suppression : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- IMPORT JSON ---
  const handleImport = async () => {
    if (!editingTemplate?.id) return toast.error("Sélectionnez un template");
    let questionsJson;
    try {
      questionsJson = JSON.parse(jsonData);
      if (!Array.isArray(questionsJson)) throw new Error("JSON doit être un tableau");
    } catch (err) {
      return toast.error("JSON invalide : " + err.message);
    }
    try {
      setLoading(true);
      await dispatch(importTemplateQuestions({ templateId: editingTemplate.id, questions: questionsJson }));
      toast.success("Questions importées !");
      setJsonData("");
      dispatch(fetchTemplates());
    } catch (err) {
      toast.error("Erreur import JSON : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {loading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50 rounded-2xl">
          <Loader />
        </div>
      )}

      <h2 className="text-3xl font-bold text-gray-800">📋 Gestion des Templates & Questions</h2>

      <TemplateForm
        templateForm={templateForm}
        setTemplateForm={setTemplateForm}
        onSubmit={handleSubmitTemplate}
        onCancel={handleCancelTemplate}
        editingTemplate={editingTemplate}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              editingTemplate={editingTemplate}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            >
              {/* Questions list + form + import JSON */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-2 overflow-hidden"
                >
                  {t.questions_reponses?.map((q) => (
                    <motion.div
                      key={q.id}
                      layout
                      className="flex flex-col md:flex-row justify-between items-start p-3 bg-gray-50 rounded-xl shadow-sm gap-2"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-700">{q.ordre}. {q.question}</p>
                      </div>
                      <div className="flex-1 text-right mt-2 md:mt-0">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">{q.reponse}</span>
                      </div>
                      <div className="flex gap-2 mt-2 md:mt-0">
                        <button onClick={() => handleEditQuestion(q)} className="text-blue-500 hover:text-blue-600">✏️</button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 hover:text-red-600">🗑️</button>
                      </div>
                    </motion.div>
                  ))}

                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <h4 className="text-lg font-semibold mb-2">Ajouter / Modifier Question</h4>
                    <QuestionForm
                      questionForm={questionForm}
                      setQuestionForm={setQuestionForm}
                      onSubmit={handleSubmitQuestion}
                      onCancel={handleCancelQuestion}
                      editingQuestion={editingQuestion}
                    />
                  </div>

                  <div className="mt-4">
                    <textarea
                      placeholder='Ex: [{"question":"Q1","reponse":"R1","ordre":1}]'
                      value={jsonData}
                      onChange={(e) => setJsonData(e.target.value)}
                      className="border p-3 rounded-xl w-full h-32 bg-gray-50 focus:ring-2 focus:ring-purple-400 transition"
                    />
                    <button
                      onClick={handleImport}
                      className="mt-2 bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition transform hover:scale-105 active:scale-95"
                    >
                      Importer JSON
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </TemplateCard>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
