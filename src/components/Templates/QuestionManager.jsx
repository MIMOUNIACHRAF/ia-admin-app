import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
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

  const [newQuestion, setNewQuestion] = useState({ question: "", reponse: "", ordre: 1 });
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
      { ...newQuestion, id: `new-${Date.now()}`, isNew: true, isDirty: true },
      ...prev,

    ]);
    setNewQuestion({ question: "", reponse: "", ordre: questions.length + 1 });
  };

  // ✏️ Modification locale
  const handleEditLocal = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, [field]: field === "ordre" ? Number(value) : value, isDirty: true } : q
      )
    );
  };

  // 🗑️ Suppression locale / API
  const handleDeleteLocal = async (index) => {
    const q = questions[index];
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

  // 💾 Sauvegarde DB + rafraîchissement
  const handleSaveAll = async () => {
    try {
      const modifiedQuestions = questions.filter((q) => q.isNew || q.isDirty);

      for (const q of modifiedQuestions) {
        if (q.isNew) {
          await dispatch(createQuestion({ templateId: template.id, questionData: cleanQuestionForApi(q) })).unwrap();
        } else {
          await dispatch(updateQuestion({ id: q.id, data: cleanQuestionForApi(q) })).unwrap();
        }
      }

      toast.success("Questions sauvegardées !");
      // 🔄 Recharger les questions depuis l'API
      const updatedTemplates = await dispatch(fetchTemplates()).unwrap();
      const updatedTemplate = updatedTemplates.find((t) => t.id === template.id);
      setQuestions(
        (updatedTemplate?.questions_reponses || []).map((q) => ({
          ...q,
          isNew: false,
          isDirty: false,
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  // 🔍 Filtre et pagination
  const filteredQuestions = questions.filter(
    (q) =>
      q.question.toLowerCase().includes(filter.toLowerCase()) ||
      q.reponse.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredQuestions.length / pageSize);
  const paginatedQuestions = filteredQuestions.slice((page - 1) * pageSize, page * pageSize);
  const handleNextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const handlePrevPage = () => setPage((p) => Math.max(p - 1, 1));

  // 🔹 Surlignage mot recherché
  // Composant pour surligner le mot recherché
        const HighlightedText = ({ text, highlight }) => {
        if (!highlight) return text;
        const regex = new RegExp(`(${highlight})`, "gi");
        return text.split(regex).map((part, i) =>
            regex.test(part) ? <span key={i} className="bg-yellow-300">{part}</span> : part
        );
        };


  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-start pt-12 px-4 overflow-auto">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-6xl rounded-2xl p-6 shadow-xl flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">Éditeur de Questions</h2>
          <button onClick={onClose} className="text-red-500 text-xl">✖️</button>
        </div>

        {/* Total + recherche */}
        <div className="flex justify-between items-center mb-4">
                {/* Total Questions */}
                <span className="text-gray-700 font-semibold text-lg">
                    Total Questions : <span className="text-blue-600">{filteredQuestions.length}</span>
                </span>

                {/* Barre de recherche */}
                <div className="relative w-1/3">
                    <input
                    type="text"
                    placeholder="Rechercher une question ou réponse..."
                    value={filter}
                    onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                    className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-xl p-2 w-full"
                    />
                    {filter && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                            onClick={() => setFilter("")}>
                        ✖️
                    </span>
                    )}
                </div>
                </div>


        {/* Ajout */}
        <div className="flex gap-2 mb-4">
          <input
            placeholder="Question"
            value={newQuestion.question}
            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
            className="border p-2 rounded-xl flex-1"
          />
          <input
            placeholder="Réponse"
            value={newQuestion.reponse}
            onChange={(e) => setNewQuestion({ ...newQuestion, reponse: e.target.value })}
            className="border p-2 rounded-xl flex-1"
          />
          <button onClick={handleAdd} className="bg-purple-500 text-white px-4 rounded-xl">Ajouter</button>
        </div>

        {/* Tableau Questions */}
        <div className="overflow-auto max-h-[60vh] border rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Question</th>
                <th className="px-4 py-2 text-left">Réponse</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedQuestions.map((q, idx) => (
                <tr
                  key={q.id}
                  className={q.isNew ? "bg-green-50" : q.isDirty ? "bg-yellow-50" : "bg-white"}
                >
                  <td className="px-4 py-2">
                    <input
                      value={q.question}
                      onChange={(e) =>
                        handleEditLocal(idx + (page - 1) * pageSize, "question", e.target.value)
                      }
                      className="border p-2 rounded-xl w-full"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      value={q.reponse}
                      onChange={(e) =>
                        handleEditLocal(idx + (page - 1) * pageSize, "reponse", e.target.value)
                      }
                      className="border p-2 rounded-xl w-full"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDeleteLocal(idx + (page - 1) * pageSize)}
                      className="text-red-500 px-2 py-1 rounded-lg border hover:bg-red-50"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
  <div className="flex justify-center gap-2 mt-2 flex-wrap">
    {/* Bouton Précédent */}
    <button
      onClick={handlePrevPage}
      disabled={page === 1}
      className="px-3 py-1 border rounded-lg"
    >
      ◀️
    </button>

    {/* Liste automatique des pages */}
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
      <button
        key={p}
        onClick={() => setPage(p)}
        className={`px-3 py-1 border rounded-lg ${
          p === page ? "bg-purple-500 text-white" : "bg-white text-gray-700"
        }`}
      >
        {p}
      </button>
    ))}

    {/* Bouton Suivant */}
    <button
      onClick={handleNextPage}
      disabled={page === totalPages}
      className="px-3 py-1 border rounded-lg"
    >
      ▶️
    </button>
  </div>
)}



        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={handleSaveAll} className="bg-green-500 text-white px-6 py-2 rounded-xl">Sauvegarder</button>
          <button onClick={onClose} className="bg-gray-300 px-6 py-2 rounded-xl">Annuler</button>
        </div>
      </motion.div>
    </div>
  );
}
