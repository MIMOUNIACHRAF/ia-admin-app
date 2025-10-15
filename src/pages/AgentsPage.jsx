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

export default function AgentsPage() {
  const dispatch = useDispatch();

  // fallback pour éviter undefined
  const agentsState = useSelector(
    (state) => state.agents || { list: [], loading: false }
  );
  const templatesState = useSelector(
    (state) => state.templates || { list: [] }
  );

  const { list: agents, loading } = agentsState;
  const { list: templates } = templatesState;

  const [editingAgent, setEditingAgent] = useState(null);

  useEffect(() => {
    dispatch(fetchAgents());
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleSubmit = async (data) => {
    if (editingAgent) {
      await dispatch(updateAgent({ id: editingAgent.id, data }));
    } else {
      await dispatch(createAgent(data));
    }
    setEditingAgent(null);
  };

  const handleAssign = (agentId, templateId) =>
    dispatch(assignTemplate({ agentId, templateId }));
  const handleUnassign = (agentId, templateId) =>
    dispatch(unassignTemplate({ agentId, templateId }));

  const handleMatch = async (agentId, question) => {
    try {
      const res = await fetch(
        `/V1/agents/${agentId}/match/?question=${encodeURIComponent(question)}`
      );
      return await res.json();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  if (!agentsState || !templatesState) return <Loader />;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Agents IA</h2>
      <AgentForm onSubmit={handleSubmit} initialData={editingAgent} templates={templates} />
      {loading ? (
        <Loader />
      ) : (
        <AgentList
          agents={agents}
          onEdit={setEditingAgent}
          onDelete={(id) => dispatch(deleteAgent(id))}
        />
      )}
      {editingAgent && (
        <>
          <AgentTemplates
            agent={editingAgent}
            templates={templates}
            onAssign={handleAssign}
            onUnassign={handleUnassign}
          />
          <AgentMatch agent={editingAgent} onMatch={handleMatch} />
        </>
      )}
    </div>
  );
}
