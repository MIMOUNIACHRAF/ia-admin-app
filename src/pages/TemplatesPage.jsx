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

  // fallback pour éviter undefined
  const templatesState = useSelector(
    (state) => state.templates || { list: [], loading: false }
  );
  const { list: templates, loading } = templatesState;

  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleSubmit = async (data) => {
    if (editingTemplate) {
      await dispatch(updateTemplate({ id: editingTemplate.id, data }));
    } else {
      await dispatch(createTemplate(data));
    }
    setEditingTemplate(null);
  };

  if (!templatesState) return <Loader />;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Templates</h2>
      <TemplateForm onSubmit={handleSubmit} initialData={editingTemplate} />
      {loading ? (
        <Loader />
      ) : (
        <TemplateList
          templates={templates}
          onEdit={setEditingTemplate}
          onDelete={(id) => dispatch(deleteTemplate(id))}
        />
      )}
    </div>
  );
}
