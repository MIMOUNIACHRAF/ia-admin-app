import React from "react";

export default function Dashboard() {
  return (
    <div className="bg-blue-50 min-h-[200px] flex flex-col justify-center items-center rounded-lg shadow-md p-8">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-4">
        Bienvenue sur le Dashboard
      </h1>
      <p className="text-blue-600 text-lg">Voici un aperçu de votre activité</p>
    </div>
  );
}
