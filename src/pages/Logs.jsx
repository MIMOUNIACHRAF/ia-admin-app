import React from "react";

export default function Logs() {
  return (
    <div className="bg-gray-900 text-white min-h-[200px] flex flex-col justify-center items-center rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-semibold mb-4">Logs du système</h1>
      <p className="text-gray-300">Consultez les événements récents ici.</p>
    </div>
  );
}
