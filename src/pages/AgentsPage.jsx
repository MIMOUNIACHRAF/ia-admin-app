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
// import { API_BASE_URL, API_ENDPOINTS } from "../api/config";

export default function AgentsPage() {
  const dispatch = useDispatch();
  const agentsState = useSelector(state => state.agents);
  const templatesState = useSelector(state => state.templates);
  const authState = useSelector(state => state.auth); // accessToken + refreshToken

  const { list: agents = [], loading: agentsLoading } = agentsState || {};
  const { list: templates = [], loading: templatesLoading } = templatesState || {};
  const { accessToken, refreshToken } = authState || {};

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [matching, setMatching] = useState(false); // loader pour handleMatch

  // charger agents et templates
  useEffect(() => {
    dispatch(fetchAgents());
    dispatch(fetchTemplates());
  }, [dispatch]);

  // synchroniser selectedAgent après update
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

  const handleAssign = (agentId, templateId) =>
    dispatch(assignTemplate({ agentId, templateId }));
  const handleUnassign = (agentId, templateId) =>
    dispatch(unassignTemplate({ agentId, templateId }));

  const handleMatch = async (agentId, question) => {
    if (!accessToken || !refreshToken) {
      console.error("Tokens manquants, veuillez vous reconnecter.");
      return null;
    }

    setMatching(true);
    try {
      const res = await fetch(
        `https://achrafpapaza.pythonanywhere.com/api/V1/agents/${agentId}/match/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "x-refresh-token": refreshToken,
          },
          body: JSON.stringify({ question }),
          credentials: "include", // si le refresh token est aussi en cookie
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        console.error(`Erreur HTTP: ${res.status}`, errorData);
        return null;
      }

      return await res.json();
    } catch (err) {
      console.error("Erreur fetch handleMatch:", err);
      return null;
    } finally {
      setMatching(false);
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
          <AgentMatch
            agent={selectedAgent}
            onMatch={handleMatch}
            loading={matching} // passe le loader à AgentMatch
          />
        </>
      )}
    </div>
  );
}
