export default function AgentsPage() {
  const dispatch = useDispatch();
  const agentsState = useSelector(state => state.agents || { list: [], loading: false });
  const templatesState = useSelector(state => state.templates || { list: [] });
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    dispatch(fetchAgents());
    dispatch(fetchTemplates());
  }, [dispatch]);

  // synchroniser selectedAgent avec les changements de Redux
  useEffect(() => {
    if (selectedAgent) {
      const updated = agentsState.list.find(a => a.id === selectedAgent.id);
      if (updated) setSelectedAgent(updated);
    }
  }, [agentsState.list, selectedAgent]);

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
      {selectedAgent && (
        <AgentTemplates
          agent={selectedAgent}
          templates={templatesState.list}
          onAssign={handleAssign}
          onUnassign={handleUnassign}
        />
      )}
    </div>
  );
}
