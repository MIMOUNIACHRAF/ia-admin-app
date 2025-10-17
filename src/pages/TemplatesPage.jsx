import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../features/templates/templatesSlice";
import TemplateList from "../components/Templates/TemplateList";
import TemplateForm from "../components/Templates/TemplateForm";
import Loader from "../components/common/Loader";

export default function TemplatesPage() {
  const dispatch = useDispatch();

  const { list: templates, loading, error } = useSelector((state) => state.templates);

  const [editingTemplate, setEditingTemplate] = useState(null);

  // Charger les templates au montage
  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  // Fonction pour recharger après chaque action
  const refreshTemplates = async () => {
    await dispatch(fetchTemplates());
  };

  // Soumission du formulaire
  const handleSubmit = async (data) => {
    if (editingTemplate) {
      await dispatch(updateTemplate({ id: editingTemplate.id, data }));
    } else {
      await dispatch(createTemplate(data));
    }
    setEditingTemplate(null);
    await refreshTemplates(); // rechargement automatique
  };

  // Suppression d’un template
  const handleDelete = async (id) => {
    if (window.confirm("Confirmer la suppression de ce template ?")) {
      await dispatch(deleteTemplate(id));
      await refreshTemplates(); // rechargement automatique
    }
  };

  // Logs debug
  useEffect(() => {
    console.log("Templates chargés :", templates);
  }, [templates]);

  // États d’affichage
  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <h2 className="font-bold mb-2">Erreur de chargement</h2>
        <pre className="bg-red-100 p-2 rounded text-sm">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Templates</h2>

      <TemplateForm onSubmit={handleSubmit} initialData={editingTemplate} />

      {!templates || templates.length === 0 ? (
        <p className="text-gray-500 italic">Aucun template disponible.</p>
      ) : (
        <TemplateList
          templates={templates}
          onEdit={setEditingTemplate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
