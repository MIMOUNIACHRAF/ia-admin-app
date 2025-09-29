// src/services/agentsService.js
import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/config";

function transformFromBackend(item) {
  return {
    id: item.id,
    nom: item.nom,
    description: item.description,
    type_agent: item.type_agent,
    actif: item.actif,
    questions_reponses: item.questions_reponses || [],
  };
}

function transformToBackend(payload) {
  return {
    id: payload.id,
    nom: payload.nom,
    description: payload.description,
    type_agent: payload.type_agent,
    actif: payload.actif,
    questions_reponses: payload.questions_reponses || [],
  };
}

const agentsService = {
  getAgents: async () => {
    const res = await api.get(API_ENDPOINTS.AGENTS);
    const results = res.data?.results ?? res.data;
    return (results || []).map(transformFromBackend);
  },

  createAgent: async (agent) => {
    const backend = transformToBackend(agent);
    const res = await api.post(API_ENDPOINTS.AGENTS, backend);
    return transformFromBackend(res.data);
  },

  updateAgent: async (id, agent) => {
    const backend = transformToBackend(agent);
    const res = await api.put(`${API_ENDPOINTS.AGENTS}${id}/`, backend);
    return transformFromBackend(res.data);
  },

  deleteAgent: async (id) => {
    await api.delete(`${API_ENDPOINTS.AGENTS}${id}/`);
    return true;
  },
};

export default agentsService;
