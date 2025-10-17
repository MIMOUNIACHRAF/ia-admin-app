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
import api from "../api/axiosInstance";

export default function AgentsPage() {
  const dispatch = useDispatch();
  const agentsState = useSelector(state => state.agents);
  const templatesState = useSelector(state => state.templates);
  const authState = useSelector(state => state.auth);

  const { list: agents = [], loading: agentsLoading } = agentsState || {};
  const { list: templates = [], loading: templatesLoading } = templatesState || {};

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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h2 className="text-3xl font-extrabold text-gray-800">Agents IA</h2>

      <div className="bg-white shadow rounded-xl p-6">
        <AgentForm
          onSubmit={handleSubmit}
          initialData={selectedAgent}
          templates={templates}
        />
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <AgentList
          agents={agents}
          onEdit={setSelectedAgent}
          onDelete={(id) => dispatch(deleteAgent(id))}
        />
      </div>

      {selectedAgent && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-xl p-6">
            <AgentTemplates
              agent={selectedAgent}
              templates={templates}
              onAssign={handleAssign}
              onUnassign={handleUnassign}
            />
          </div>
          <div className="bg-white shadow rounded-xl p-6">
            <AgentMatch
              agent={selectedAgent}
              onMatch={handleMatch}
              loading={matching}
            />
          </div>
        </div>
      )}
    </div>
  );
}
