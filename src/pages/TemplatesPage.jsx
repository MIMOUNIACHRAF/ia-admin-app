import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { fetchTemplates, deleteTemplate } from "../features/templates/templatesSlice";
import Loader from "../components/common/Loader";
import TemplateForm from "../components/Templates/TemplateForm";
import TemplateCard from "../components/Templates/TemplateCard";
import QuestionManager from "../components/Templates/QuestionManager";

export default function TemplatesPageModern() {
  const dispatch = useDispatch();
  const { list: templates = [] } = useSelector((state) => state.templates);

  const [modalTemplate, setModalTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ nom: "", description: "" });
  const [loading, setLoading] = useState(false);

  // Synchroniser le formulaire avec le template en édition
  useEffect(() => {
    if (editingTemplate) {
      setTemplateForm({
        nom: editingTemplate.nom || "",
        description: editingTemplate.description || "",
      });
    } else {
      setTemplateForm({ nom: "", description: "" });
    }
  }, [editingTemplate]);

  // Charger les templates
  useEffect(() => {
    setLoading(true);
    dispatch(fetchTemplates()).finally(() => setLoading(false));
  }, [dispatch]);

  // Ouvrir modal Questions
  const handleOpenModal = (template) => setModalTemplate(template);
  const handleCloseModal = () => setModalTemplate(null);

  // Supprimer un template
  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce template ?")) return;
    try {
      await dispatch(deleteTemplate(id)).unwrap();
      toast.success("Template supprimé !");
      if (editingTemplate?.id === id) setEditingTemplate(null);
    } catch (err) {
      toast.error("Erreur lors de la suppression");
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

      <h2 className="text-3xl font-bold text-gray-800">
        📋 Gestion des Templates & Questions
      </h2>

      {/* Formulaire ajout / modification */}
      <TemplateForm
        templateForm={templateForm}
        setTemplateForm={setTemplateForm}
        editingTemplate={editingTemplate}
        setEditingTemplate={setEditingTemplate}
      />

      {/* Liste des templates */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              editingTemplate={editingTemplate}
              setEditingTemplate={setEditingTemplate}
              onOpenQuestions={handleOpenModal}
              onDelete={() => handleDelete(t.id)} // suppression directe depuis la carte
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Modal gestion Questions */}
      {modalTemplate && (
        <QuestionManager
          template={modalTemplate}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
