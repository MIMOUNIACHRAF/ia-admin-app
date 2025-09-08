import api from "../api/axiosInstance";
import { API_ENDPOINTS } from "../api/config";

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
  };
}

const agentsService = {
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
  },
};

export default agentsService;
