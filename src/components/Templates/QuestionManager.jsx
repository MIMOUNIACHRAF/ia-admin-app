import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../features/questions/questionsSlice";
import { fetchTemplates } from "../../features/templates/templatesSlice";

export default function QuestionEditorModal({ template, onClose }) {
  const dispatch = useDispatch();

  const [questions, setQuestions] = useState(
    (template?.questions_reponses || []).map((q) => ({
      ...q,
      isNew: false,
      isDirty: false,
    }))
  );

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    reponse: "",
    ordre: 1,
  });

  const [filter, setFilter] = useState("");

  // 🔒 ESC ferme le modal
  useEffect(() => {
    const handleKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // 🔧 Nettoyage avant envoi API
  const cleanQuestionForApi = (q) => {
    const { id, isNew, isDirty, ...data } = q;
    return data;
  };

  // ➕ Ajout local
  const handleAdd = () => {
    if (!newQuestion.question || !newQuestion.reponse) {
      toast.error("Veuillez remplir question et réponse !");
      return;
    }

    setQuestions((prev) => [
      ...prev,
      {
        ...newQuestion,
        id: `new-${Date.now()}`, // ID temporaire
        isNew: true,
        isDirty: true,
      },
    ]);

    setNewQuestion({
      question: "",
      reponse: "",
      ordre: questions.length + 1,
    });
  };

  // ✏️ Modification locale
  const handleEditLocal = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index
          ? {
              ...q,
              [field]: field === "ordre" ? Number(value) : value,
              isDirty: true,
            }
          : q
      )
    );
  };

  // 🗑️ Suppression locale (DB plus tard si besoin)
 const handleDeleteLocal = async (index) => {
  const q = questions[index];

  // Nouveau (pas encore en DB)
  if (q.isNew) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    toast.success("Question supprimée");
    return;
  }

  if (!window.confirm("Supprimer cette question ?")) return;

  try {
    await dispatch(deleteQuestion(q.id)).unwrap();
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    toast.success("Question supprimée");
  } catch (err) {
    console.error(err);
    toast.error("Erreur lors de la suppression");
  }
};

  // 💾 Sauvegarde DB
  const handleSaveAll = async () => {
    try {
      const modifiedQuestions = questions.filter(
        (q) => q.isNew || q.isDirty
      );

      for (const q of modifiedQuestions) {
        if (q.isNew) {
          await dispatch(
            createQuestion({
              templateId: template.id,
              questionData: cleanQuestionForApi(q),
            })
          ).unwrap();
        } else {
          await dispatch(
            updateQuestion({
              id: q.id,
              data: cleanQuestionForApi(q),
            })
          ).unwrap();
        }
      }

      toast.success("Questions sauvegardées !");
      dispatch(fetchTemplates());
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  // 🔍 Filtre
  const filteredQuestions = questions.filter(
    (q) =>
      q.question.toLowerCase().includes(filter.toLowerCase()) ||
      q.reponse.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-5xl rounded-2xl p-6 shadow-xl flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Éditeur de Questions</h2>
          <button onClick={onClose} className="text-red-500 text-xl">
            ✖️
          </button>
        </div>

        {/* Recherche */}
        <input
          type="text"
          placeholder="Rechercher..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-3 rounded-xl"
        />

        {/* Ajout */}
        <div className="flex gap-2">
          <input
            placeholder="Question"
            value={newQuestion.question}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, question: e.target.value })
            }
            className="border p-2 rounded-xl flex-1"
          />
          <input
            placeholder="Réponse"
            value={newQuestion.reponse}
            onChange={(e) =>
              setNewQuestion({ ...newQuestion, reponse: e.target.value })
            }
            className="border p-2 rounded-xl flex-1"
          />
          <button
            onClick={handleAdd}
            className="bg-purple-500 text-white px-4 rounded-xl"
          >
            Ajouter
          </button>
        </div>

        {/* Liste */}
        <div className="max-h-[50vh] overflow-auto space-y-2">
          <AnimatePresence>
            {filteredQuestions.map((q, index) => (
              <motion.div key={q.id} layout className="flex gap-2">
                <input
                  value={q.question}
                  onChange={(e) =>
                    handleEditLocal(index, "question", e.target.value)
                  }
                  className="border p-2 flex-1 rounded-xl"
                />
                <input
                  value={q.reponse}
                  onChange={(e) =>
                    handleEditLocal(index, "reponse", e.target.value)
                  }
                  className="border p-2 flex-1 rounded-xl"
                />
                <button
                  onClick={() => handleDeleteLocal(index)}
                  className="text-red-500"
                >
                  🗑️
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={handleSaveAll}
            className="bg-green-500 text-white px-6 py-2 rounded-xl"
          >
            Sauvegarder
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-6 py-2 rounded-xl"
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </div>
  );
}
