import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/config";

<<<<<<< HEAD
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
=======
// Mapping API ↔ Frontend
function mapFromApi(agent) {
  return {
    id: agent.id,
    name: agent.nom,
    role: agent.description,
    type: agent.type_agent,
    actif: agent.actif,
    prompts: (agent.questions_reponses || []).map((q) => ({
      id: q.id,
      question: q.question,
      answer: q.reponse,
    })),
  };
}

function mapToApi(agent) {
  return {
    nom: agent.name,
    description: agent.role,
    type_agent: agent.type || "trad",
    actif: agent.actif ?? true,
    questions_reponses: (agent.prompts || []).map((p) => ({
      id: p.id,
      question: p.question,
      reponse: p.answer,
    })),
>>>>>>> 865a17bc326d8ebedc31dc2b2545e7a53054d132
  };
}

const agentsService = {
<<<<<<< HEAD
  getAgents: async () => {
    const res = await api.get(API_ENDPOINTS.AGENTS);
    const data = res.data;
    const results = data?.results ?? data;
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
=======
  async fetchAll() {
    const res = await api.get(API_ENDPOINTS.AGENTS);
    return res.data.results.map(mapFromApi);
  },

  async create(agent) {
    const res = await api.post(API_ENDPOINTS.AGENTS, mapToApi(agent));
    return mapFromApi(res.data);
  },

  async update(id, agent) {
    const res = await api.put(`${API_ENDPOINTS.AGENTS}${id}/`, mapToApi(agent));
    return mapFromApi(res.data);
  },

  async remove(id) {
    await api.delete(`${API_ENDPOINTS.AGENTS}${id}/`);
    return id;
>>>>>>> 865a17bc326d8ebedc31dc2b2545e7a53054d132
  },
};

export default agentsService;
