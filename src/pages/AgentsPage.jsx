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
import { API_ENDPOINTS } from "../api/config";

export default function AgentsPage() {
  const dispatch = useDispatch();
  const agentsState = useSelector(state => state.agents);
  const templatesState = useSelector(state => state.templates);

  const { list: agents = [], loading: agentsLoading } = agentsState || {};
  const { list: templates = [], loading: templatesLoading } = templatesState || {};

  const [selectedAgent, setSelectedAgent] = useState(null);

  // charger agents et templates
  useEffect(() => {
    dispatch(fetchAgents());
    dispatch(fetchTemplates());
  }, [dispatch]);

  // synchroniser selectedAgent avec Redux après update
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
    try {
      const res = await fetch(`${API_ENDPOINTS.AGENTS}${agentId}/match/`, {
        method: "POST",
        body: JSON.stringify({ question }),
        headers: { "Content-Type": "application/json" },
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  if (agentsLoading || templatesLoading) return <Loader />;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Agents IA</h2>

      <AgentForm
        onSubmit={handleSubmit}
        initialData={selectedAgent}
        templates={templates}
      />

      <AgentList
        agents={agents}
        onEdit={setSelectedAgent}
        onDelete={(id) => dispatch(deleteAgent(id))}
      />

      {selectedAgent && (
        <>
          <AgentTemplates
            agent={selectedAgent}
            templates={templates}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
          />
          <AgentMatch agent={selectedAgent} onMatch={handleMatch} />
        </>
      )}
    </div>
  );
}
