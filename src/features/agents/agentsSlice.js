import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import agentsService from "../../services/agentsService";
export const fetchAgents = createAsyncThunk("agents/fetchAll", async () => {
  return await agentsService.fetchAll();
});

// Create agent
export const createAgent = createAsyncThunk(
  "agents/create",
  async (agent) => {
    return await agentsService.create(agent);
  }
);

// Delete agent
export const removeAgent = createAsyncThunk(
  "agents/remove",
  async (id) => {
    return await agentsService.remove(id);
  }
);

const agentsSlice = createSlice({
  name: "agents",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgents.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(removeAgent.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a.id !== action.payload);
      });
  },
});

export default agentsSlice.reducer;
