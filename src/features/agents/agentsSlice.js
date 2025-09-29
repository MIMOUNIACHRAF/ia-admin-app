import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import agentsService from "../../services/agentsService";

/* Thunks CRUD */
export const fetchAgents = createAsyncThunk("agents/fetch", async (_, { rejectWithValue }) => {
  try {
    const data = await agentsService.getAgents();
    return data;
  } catch (err) {
    return rejectWithValue(err?.message || "fetch failed");
  }
});

export const createAgent = createAsyncThunk("agents/create", async (agent, { rejectWithValue }) => {
  try {
    const data = await agentsService.createAgent(agent);
    return data;
  } catch (err) {
    return rejectWithValue(err?.message || "create failed");
  }
});

export const updateAgent = createAsyncThunk(
  "agents/update",
  async ({ id, agent }, { rejectWithValue }) => {
    try {
      const data = await agentsService.updateAgent(id, agent);
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || "update failed");
    }
  }
);

export const deleteAgent = createAsyncThunk("agents/delete", async (id, { rejectWithValue }) => {
  try {
    await agentsService.deleteAgent(id);
    return id;
  } catch (err) {
    return rejectWithValue(err?.message || "delete failed");
  }
});

/* Slice */
const agentsSlice = createSlice({
  name: "agents",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (s) => { s.status = "loading"; s.error = null; })
      .addCase(fetchAgents.fulfilled, (s, a) => { s.status = "succeeded"; s.items = a.payload; })
      .addCase(fetchAgents.rejected, (s, a) => { s.status = "failed"; s.error = a.payload || a.error.message; })

      .addCase(createAgent.fulfilled, (s, a) => { s.items.push(a.payload); })
      .addCase(createAgent.rejected, (s, a) => { s.error = a.payload || a.error.message; })

      .addCase(updateAgent.fulfilled, (s, a) => {
        const idx = s.items.findIndex((it) => it.id === a.payload.id);
        if (idx >= 0) s.items[idx] = a.payload;
      })
      .addCase(updateAgent.rejected, (s, a) => { s.error = a.payload || a.error.message; })

      .addCase(deleteAgent.fulfilled, (s, a) => { s.items = s.items.filter((it) => it.id !== a.payload); })
      .addCase(deleteAgent.rejected, (s, a) => { s.error = a.payload || a.error.message; });
  },
});

export default agentsSlice.reducer;
