import React from "react";
import { motion } from "framer-motion";

/**
 * QuestionForm Component
 *
 * Props:
 * - questionForm: { question, reponse, ordre }
 * - setQuestionForm: function (state setter)
 * - onSubmit: function (submit handler)
 * - onCancel: function (cancel edit)
 * - editingQuestion: object | null
 */
export default function QuestionForm({
  questionForm,
  setQuestionForm,
  onSubmit,
  onCancel,
  editingQuestion,
}) {
  // Sécurise les champs (évite undefined)
  const { question = "", reponse = "", ordre = 1 } = questionForm;

  // Handler générique
  const handleChange = (field, value) => {
    setQuestionForm((prev) => ({
      ...prev,
      [field]: field === "ordre" ? Number(value) : value,
    }));
  };

  return (
    <motion.form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      className="flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl shadow-md"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Question */}
      <input
        type="text"
        placeholder="Question"
        value={question}
        onChange={(e) => handleChange("question", e.target.value)}
        className="border p-3 rounded-xl focus:ring-2 focus:ring-green-400 transition w-full"
        required
      />

      {/* Réponse */}
      <textarea
        placeholder="Réponse"
        value={reponse}
        onChange={(e) => handleChange("reponse", e.target.value)}
        className="border p-3 rounded-xl focus:ring-2 focus:ring-green-400 transition w-full"
        rows={3}
        required
      />

      {/* Ordre */}
      <input
        type="number"
        value={ordre}
        onChange={(e) => handleChange("ordre", e.target.value)}
        className="border p-3 rounded-xl focus:ring-2 focus:ring-green-400 transition w-24"
        min={1}
        required
      />

      {/* Actions */}
      <div className="flex gap-3 mt-2">
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition transform hover:scale-105 active:scale-95 flex-1"
        >
          {editingQuestion ? "Modifier la question" : "Ajouter la question"}
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
    </motion.form>
  );
}
