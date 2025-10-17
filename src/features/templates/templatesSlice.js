import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/config";

export const fetchTemplates = createAsyncThunk(
  "templates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.TEMPLATES);
      const data = response.data;
      // Supporte les 2 formats de réponse
      return Array.isArray(data) ? data : data.results || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

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
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createTemplate.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const idx = state.list.findIndex((t) => t.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t.id !== action.payload);
      });
  },
});

export default templatesSlice.reducer;
