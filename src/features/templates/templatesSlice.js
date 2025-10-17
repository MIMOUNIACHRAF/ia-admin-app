import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/config";

// --- FETCH ALL ---
export const fetchTemplates = createAsyncThunk(
  "templates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.TEMPLATES);
      const data = response.data;

      // ✅ Support des 2 formats de réponse (liste directe ou paginée)
      if (Array.isArray(data)) {
        return { results: data, count: data.length };
      } else if (data.results) {
        return data;
      } else {
        return { results: [], count: 0 };
      }
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// --- CREATE ---
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

// --- UPDATE ---
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

// --- DELETE ---
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

// --- SLICE ---
const templatesSlice = createSlice({
  name: "templates",
  initialState: {
    list: [],
    count: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.results || [];
        state.count = action.payload.count || state.list.length;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.count += 1;
      })

      // Update
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const index = state.list.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })

      // Delete
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t.id !== action.payload);
        state.count -= 1;
      });
  },
});

export default templatesSlice.reducer;
