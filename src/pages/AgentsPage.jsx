import React, { useEffect, useState, useCallback } from "react";
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
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import api from "../api/axiosInstance";

export default function AgentsPage() {
  const dispatch = useDispatch();
  const { list: agents = [], loading: agentsLoading } = useSelector(state => state.agents) || {};
  const { list: templates = [], loading: templatesLoading } = useSelector(state => state.templates) || {};

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [matching, setMatching] = useState(false);

  // --- Fetch agents & templates au montage
  useEffect(() => {
    dispatch(fetchAgents());
    dispatch(fetchTemplates());
  }, [dispatch]);

  // --- Synchroniser selectedAgent avec la liste actualisée
  useEffect(() => {
    if (selectedAgent) {
      const updated = agents.find(a => a.id === selectedAgent.id);
      if (updated) setSelectedAgent(updated);
    }
  }, [agents, selectedAgent]);

  // --- Soumission du formulaire (création ou mise à jour)
  const handleSubmit = useCallback(async (data) => {
    try {
      if (selectedAgent) {
        await dispatch(updateAgent({ id: selectedAgent.id, data }));
        toast.success("Agent mis à jour avec succès !");
      } else {
        await dispatch(createAgent(data));
        toast.success("Agent créé avec succès !");
      }
      setSelectedAgent(null);
    } catch (err) {
      toast.error("Erreur lors de la sauvegarde de l'agent.");
      console.error(err);
    }
  }, [dispatch, selectedAgent]);

  // --- Assign / Unassign templates
  const handleAssign = useCallback((agentId, templateId) => dispatch(assignTemplate({ agentId, templateId })), [dispatch]);
  const handleUnassign = useCallback((agentId, templateId) => dispatch(unassignTemplate({ agentId, templateId })), [dispatch]);

  // --- Match question
  const handleMatch = useCallback(async (agentId, question) => {
    if (!question.trim()) return null;
    setMatching(true);
    try {
      const res = await api.post(`/agents/${agentId}/match/`, { question });
      setMatching(false);
      if (res.status === 204) return { source: "llm", detail: "Aucun match local trouvé." };
      return res.data;
    } catch (err) {
      setMatching(false);
      toast.error("Erreur lors du test de l'agent.");
      console.error(err.response?.data || err.message);
      return null;
    }
  }, []);

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
        <AgentForm
          onSubmit={handleSubmit}
          initialData={selectedAgent}
          templates={templates}
          onCancel={() => setSelectedAgent(null)} // Bouton annuler
        />
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

            <AgentMatch
              agent={selectedAgent}
              onMatch={handleMatch}
              loading={matching}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
