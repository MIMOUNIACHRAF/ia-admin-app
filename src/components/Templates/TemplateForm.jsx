import React, { useState, useEffect } from "react";

export default function TemplateForm({ onSubmit, initialData }) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialData) {
      setNom(initialData.nom);
      setDescription(initialData.description);
    }
  }, [initialData]);

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ nom, description });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom" className="w-full border px-3 py-2 rounded" required />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full border px-3 py-2 rounded" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Enregistrer</button>
    </form>
  );
}
