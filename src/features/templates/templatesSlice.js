import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/config";

// --- FETCH TEMPLATES avec questions intégrées ---
export const fetchTemplates = createAsyncThunk(
  "templates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(API_ENDPOINTS.TEMPLATES); // backend retourne questions_reponses
      return res.data.results || res.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// --- CREATE / UPDATE / DELETE TEMPLATE ---
export const createTemplate = createAsyncThunk(
  "templates/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(API_ENDPOINTS.TEMPLATES, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateTemplate = createAsyncThunk(
  "templates/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`${API_ENDPOINTS.TEMPLATES}${id}/`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

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

// --- IMPORT QUESTIONS JSON ---
export const importTemplateQuestions = createAsyncThunk(
  "templates/importQuestions",
  async ({ templateId, questions }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/V1/templates/${templateId}/import-questions/`, { questions });
      return { templateId, createdCount: res.data.created };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const templatesSlice = createSlice({
  name: "templates",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTemplates.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchTemplates.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createTemplate.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const idx = state.list.findIndex(t => t.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t.id !== action.payload);
      })
      .addCase(importTemplateQuestions.fulfilled, (state, action) => {
        const template = state.list.find(t => t.id === action.payload.templateId);
        if (template) {
          // on peut recharger les questions si nécessaire via fetchTemplates
        }
      });
  }
});

export default templatesSlice.reducer;
