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
    <div className="max-w-7xl mx-auto p-6 space-y-8 relative">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-3xl font-extrabold text-gray-800 mb-4">🤖 Agents IA</h2>

      {/* --- FORMULAIRE AGENT --- */}
      <motion.div
        className="bg-white shadow-lg rounded-2xl p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AgentForm onSubmit={handleSubmit} initialData={selectedAgent} templates={templates} />
      </motion.div>

      {/* --- LISTE AGENTS --- */}
      <motion.div
        className="bg-white shadow-lg rounded-2xl p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AgentList agents={agents} onEdit={setSelectedAgent} onDelete={(id) => dispatch(deleteAgent(id))} />
      </motion.div>

      {/* --- DETAILS AGENT --- */}
      {selectedAgent && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            className="bg-white shadow-lg rounded-2xl p-6"
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

          <motion.div
            className="bg-white shadow-lg rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Test & Match Questions</h3>
            {matching && (
              <div className="flex justify-center items-center mb-4">
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
