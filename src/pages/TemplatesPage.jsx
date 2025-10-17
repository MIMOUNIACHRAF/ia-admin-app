import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  importTemplateQuestions
} from "../features/templates/templatesSlice";
import Loader from "../components/common/Loader";

export default function TemplatesPage() {
  const dispatch = useDispatch();

  const { list: templates = [], loading = false, error = null } = useSelector(
    (state) => state.templates || {}
  );

  const [formData, setFormData] = useState({ nom: "", description: "" });
  const [editing, setEditing] = useState(null);
  const [jsonData, setJsonData] = useState(""); // pour importer JSON questions

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom.trim()) return alert("Nom requis");

    if (editing) {
      await dispatch(updateTemplate({ id: editing.id, data: formData }));
      setEditing(null);
    } else {
      await dispatch(createTemplate(formData));
    }
    setFormData({ nom: "", description: "" });
  };

  const handleEdit = (template) => {
    setEditing(template);
    setFormData({ nom: template.nom, description: template.description });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce template ?")) {
      await dispatch(deleteTemplate(id));
    }
  };

  const handleImport = async () => {
    if (!editing) return alert("Sélectionnez un template pour importer");
    let questions;
    try {
      questions = JSON.parse(jsonData);
      if (!Array.isArray(questions)) throw new Error("JSON doit être un tableau");
    } catch (err) {
      return alert("JSON invalide : " + err.message);
    }

    await dispatch(importTemplateQuestions({ templateId: editing.id, questions }));
    alert("Questions importées !");
    setJsonData("");
    dispatch(fetchTemplates());
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="text-red-600 p-4">
        Erreur : {error.detail || String(error)}
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">📋 Gestion des Templates</h2>

      {/* Formulaire création/modification */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-4 rounded-lg flex flex-col gap-3 max-w-md"
      >
        <input
          type="text"
          placeholder="Nom du template"
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          className="border p-2 rounded"
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editing ? "Modifier" : "Ajouter"}
        </button>
      </form>

      {/* Import JSON */}
      {editing && (
        <div className="bg-gray-50 p-4 rounded max-w-md">
          <h3 className="font-semibold mb-2">Importer JSON Questions/Réponses</h3>
          <textarea
            placeholder='Coller ici le JSON (ex: [{"question":"Q1","reponse":"R1","ordre":1}])'
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            className="border p-2 rounded w-full h-32"
          />
          <button
            onClick={handleImport}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Importer JSON
          </button>
        </div>
      )}

      {/* Liste des templates */}
      <div className="space-y-3">
        {templates.length === 0 ? (
          <p className="text-gray-500">Aucun template trouvé.</p>
        ) : (
          templates.map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center bg-white shadow p-3 rounded"
            >
              <div>
                <h3 className="font-semibold">{t.nom}</h3>
                <p className="text-gray-600 text-sm">{t.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(t)}
                  className="text-blue-600 hover:underline"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-red-600 hover:underline"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
