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
  const agentsState = useSelector(state => state.agents || { list: [], loading: false });
  const templatesState = useSelector(state => state.templates || { list: [] });
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    dispatch(fetchAgents());
    dispatch(fetchTemplates());
  }, [dispatch]);

  const handleSubmit = data => {
    if (selectedAgent) {
      dispatch(updateAgent({ id: selectedAgent.id, data }));
    } else {
      dispatch(createAgent(data));
    }
    setSelectedAgent(null);
  };

  const handleAssign = (agentId, templateId) => dispatch(assignTemplate({ agentId, templateId }));
  const handleUnassign = (agentId, templateId) => dispatch(unassignTemplate({ agentId, templateId }));

  return (
    <div className="p-4 space-y-6">
      {agentsState.loading && <Loader />}
      <AgentForm onSubmit={handleSubmit} initialData={selectedAgent} templates={templatesState.list} />
      <AgentList agents={agentsState.list} onEdit={setSelectedAgent} onDelete={id => dispatch(deleteAgent(id))} />
      {selectedAgent && <AgentTemplates agent={selectedAgent} templates={templatesState.list} onAssign={handleAssign} onUnassign={handleUnassign} />}
    </div>
  );
}
