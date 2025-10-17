import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/config";

// Agents CRUD
export const fetchAgents = createAsyncThunk("agents/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get(API_ENDPOINTS.AGENTS);
    return res.data.results || res.data || [];
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const createAgent = createAsyncThunk("agents/create", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post(API_ENDPOINTS.AGENTS, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const updateAgent = createAsyncThunk("agents/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`${API_ENDPOINTS.AGENTS}${id}/`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteAgent = createAsyncThunk("agents/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`${API_ENDPOINTS.AGENTS}${id}/`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// Assign/Unassign Template
export const assignTemplate = createAsyncThunk("agents/assignTemplate", async ({ agentId, templateId }, { rejectWithValue }) => {
  try {
    await api.post(`${API_ENDPOINTS.AGENTS}${agentId}/assign-template/`, { template_id: templateId });
    return { agentId, templateId };
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

export const unassignTemplate = createAsyncThunk("agents/unassignTemplate", async ({ agentId, templateId }, { rejectWithValue }) => {
  try {
    await api.post(`${API_ENDPOINTS.AGENTS}${agentId}/unassign-template/`, { template_id: templateId });
    return { agentId, templateId };
  } catch (err) { return rejectWithValue(err.response?.data || err.message); }
});

const agentsSlice = createSlice({
  name: "agents",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, state => { state.loading = true; state.error = null; })
      .addCase(fetchAgents.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchAgents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createAgent.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateAgent.fulfilled, (state, action) => {
        const idx = state.list.findIndex(a => a.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(deleteAgent.fulfilled, (state, action) => { state.list = state.list.filter(a => a.id !== action.payload); })

      .addCase(assignTemplate.fulfilled, (state, action) => {
        const agent = state.list.find(a => a.id === action.payload.agentId);
        if(agent && !agent.templates.includes(action.payload.templateId)) agent.templates.push(action.payload.templateId);
      })
      .addCase(unassignTemplate.fulfilled, (state, action) => {
        const agent = state.list.find(a => a.id === action.payload.agentId);
        if(agent) agent.templates = agent.templates.filter(t => t !== action.payload.templateId);
      });
  }
});

export default agentsSlice.reducer;
