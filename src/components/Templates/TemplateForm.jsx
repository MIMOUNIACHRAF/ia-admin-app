import React from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { createTemplate, updateTemplate, fetchTemplates } from "../../features/templates/templatesSlice";

export default function TemplateForm({ templateForm, setTemplateForm, editingTemplate, setEditingTemplate }) {
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!templateForm.nom.trim()) return toast.error("Nom requis");
    try {
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
      toast.error("Erreur : " + err.message);
    }
  };

  const handleCancel = () => {
    setEditingTemplate(null);
    setTemplateForm({ nom: "", description: "" });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
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
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition flex-1">
          {editingTemplate ? "Modifier Template" : "Ajouter Template"}
        </button>
        {editingTemplate && (
          <button type="button" onClick={handleCancel} className="bg-gray-400 text-white px-6 py-3 rounded-xl flex-1">
            Annuler
          </button>
        )}
      </div>
    </motion.form>
  );
}
