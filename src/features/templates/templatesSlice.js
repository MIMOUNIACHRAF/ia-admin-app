import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/config";

// Fetch all templates
export const fetchTemplates = createAsyncThunk(
  "templates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.TEMPLATES);
      const data = response.data;
      // Supporte DRF pagination (results) ou simple array
      return data.results || data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Create template
export const createTemplate = createAsyncThunk(
  "templates/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.TEMPLATES, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update template
export const updateTemplate = createAsyncThunk(
  "templates/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.TEMPLATES}${id}/`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Delete template
export const deleteTemplate = createAsyncThunk(
  "templates/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${API_ENDPOINTS.TEMPLATES}${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const templatesSlice = createSlice({
  name: "templates",
  initialState: {
    list: [],
    loading: false,
    error: null,
    count: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.results || action.payload || [];
        state.count = action.payload.count || state.list.length;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.count += 1;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const idx = state.list.findIndex((t) => t.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t.id !== action.payload);
        state.count -= 1;
      });
  },
});

export default templatesSlice.reducer;
