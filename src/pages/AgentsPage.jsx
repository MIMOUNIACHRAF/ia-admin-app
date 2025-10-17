import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAgents,
  createAgent,
  updateAgent,
  deleteAgent,
  assignTemplate,
  unassignTemplate,
} from "../features/agents/agentsSlice";
import { fetchTemplates } from "../features/templates/templatesSlice";
import AgentList from "../components/Agent/AgentList";
import AgentForm from "../components/Agent/AgentForm";
import AgentTemplates from "../components/Agent/AgentTemplates";
import AgentMatch from "../components/Agent/AgentMatch";
import Loader from "../components/common/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer } from "react-toastify";
import api from "../api/axiosInstance";

export default function AgentsPage() {
  const dispatch = useDispatch();
  const { list: agents = [], loading: agentsLoading } = useSelector(state => state.agents) || {};
  const { list: templates = [], loading: templatesLoading } = useSelector(state => state.templates) || {};

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    dispatch(fetchAgents());
    dispatch(fetchTemplates());
  }, [dispatch]);

  useEffect(() => {
    if (selectedAgent) {
      const updated = agents.find(a => a.id === selectedAgent.id);
      if (updated) setSelectedAgent(updated);
    }
  }, [agents, selectedAgent]);

  const handleSubmit = async (data) => {
    if (selectedAgent) await dispatch(updateAgent({ id: selectedAgent.id, data }));
    else await dispatch(createAgent(data));
    setSelectedAgent(null);
  };

  const handleAssign = (agentId, templateId) => dispatch(assignTemplate({ agentId, templateId }));
  const handleUnassign = (agentId, templateId) => dispatch(unassignTemplate({ agentId, templateId }));

  const handleMatch = async (agentId, question) => {
    setMatching(true);
    try {
      const res = await api.post(`https://achrafpapaza.pythonanywhere.com/api/V1/agents/${agentId}/match/`, { question });
      setMatching(false);
      if (res.status === 204) return { source: "llm", detail: "Aucun match local trouvé." };
      return res.data;
    } catch (err) {
      setMatching(false);
      console.error("Erreur handleMatch:", err.response?.data || err.message);
      return null;
    }
  };

  if (agentsLoading || templatesLoading) return <Loader />;

  return (
  <div className="max-w-7xl mx-auto p-6 space-y-10 relative">
    <ToastContainer position="top-right" autoClose={3000} />

    {/* --- TITRE PRINCIPAL --- */}
    <h2 className="text-4xl font-extrabold text-gray-900 mb-6">🤖 Gestion des Agents IA</h2>

    {/* --- FORMULAIRE AGENT --- */}
    <motion.div
      className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Ajouter / Modifier un Agent</h3>
      <AgentForm onSubmit={handleSubmit} initialData={selectedAgent} templates={templates} />
    </motion.div>

    {/* --- LISTE DES AGENTS --- */}
    <motion.div
      className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Liste des Agents</h3>
      <AgentList
        agents={agents}
        onEdit={setSelectedAgent}
        onDelete={(id) => dispatch(deleteAgent(id))}
      />
    </motion.div>

    {/* --- DETAILS DE L'AGENT SELECTIONNÉ --- */}
    {selectedAgent && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- TEMPLATES ASSIGNÉS --- */}
        <motion.div
          className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Templates assignés</h3>
          <AgentTemplates
            agent={selectedAgent}
            templates={templates}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
          />
        </motion.div>

        {/* --- MATCH QUESTIONS --- */}
        <motion.div
          className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition-shadow relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Test & Match Questions</h3>
          
          {matching && (
            <div className="absolute inset-0 bg-black/10 flex justify-center items-center rounded-2xl z-40">
              <Loader />
            </div>
          )}

          <AgentMatch agent={selectedAgent} onMatch={handleMatch} loading={matching} />
        </motion.div>
      </div>
    )}
  </div>
);

}
