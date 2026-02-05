import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchTemplates, deleteTemplate } from "../../features/templates/templatesSlice";
import TemplateForm from "./TemplateForm";
import TemplateCard from "./TemplateCard";
import QuestionEditorModal from "./QuestionManager"; // Assure-toi que ce fichier existe
import { toast } from "react-toastify";

export default function TemplateManager() {
  const dispatch = useDispatch();
  const templates = useSelector((state) => state.templates.list || []);

  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ nom: "", description: "" });
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Synchroniser formulaire avec template en édition
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

  // Charger templates au montage
  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  // Edition template
  const handleEdit = (tpl) => setEditingTemplate(tpl);

  // Suppression template
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

  // Ouverture modal questions
  const handleOpenQuestions = (tpl) => {
    setSelectedTemplate(tpl);
    setShowQuestionModal(true);
  };

  // Fermeture modal questions
  const handleCloseQuestions = () => {
    setSelectedTemplate(null);
    setShowQuestionModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Formulaire d'ajout / modification */}
      <TemplateForm
        templateForm={templateForm}
        setTemplateForm={setTemplateForm}
        editingTemplate={editingTemplate}
        setEditingTemplate={setEditingTemplate}
      />

      {/* Liste des templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            template={tpl}
            editingTemplate={editingTemplate}
            setEditingTemplate={setEditingTemplate}
            onOpenQuestions={handleOpenQuestions}
            onDelete={handleDelete} 
          >
            {/* Tu peux ajouter des actions spécifiques ici si besoin */}
          </TemplateCard>
        ))}
      </div>

      {/* Modal questions */}
      {showQuestionModal && selectedTemplate && (
        <QuestionEditorModal
          template={selectedTemplate}
          onClose={handleCloseQuestions}
        />
      )}
    </div>
  );
}
