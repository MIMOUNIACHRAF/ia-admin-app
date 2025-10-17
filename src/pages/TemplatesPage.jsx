import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../features/templates/templatesSlice";
import Loader from "../components/common/Loader";

export default function TemplatesPage() {
  const dispatch = useDispatch();
  const { list: templates, loading, error } = useSelector(
    (state) => state.templates || { list: [], loading: false, error: null }
  );

  const [formData, setFormData] = useState({ nom: "", description: "" });
  const [editing, setEditing] = useState(null);

  // Charger les templates au montage
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

      {/* Formulaire */}
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

      {/* Liste */}
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
