import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const validUser = "admin";
  const validPass = "admin";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === validUser && password === validPass) {
      login();
      navigate("/");
    } else {
      setError("Identifiants incorrects");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-8 bg-white rounded shadow mt-20">
      <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>

      <label htmlFor="username" className="block mb-2 font-semibold">
        Nom d'utilisateur
      </label>
      <input
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        required
      />

      <label htmlFor="password" className="block mb-2 font-semibold">
        Mot de passe
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        required
      />

      {error && <p className="mb-4 text-red-600">{error}</p>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Se connecter
      </button>
    </form>
  );
}
