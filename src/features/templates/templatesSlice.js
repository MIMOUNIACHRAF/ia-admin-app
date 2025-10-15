import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import { API_ENDPOINTS } from "../../api/config";

export const fetchTemplates = createAsyncThunk(
  "templates/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.TEMPLATES);
      return response.data.results || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
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
      return rejectWithValue(err.response?.data);
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
      return rejectWithValue(err.response?.data);
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
      return rejectWithValue(err.response?.data);
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
  extraReducers: builder => {
    builder
      .addCase(fetchTemplates.pending, state => { state.loading = true; })
      .addCase(fetchTemplates.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchTemplates.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createTemplate.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        const idx = state.list.findIndex(t => t.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t.id !== action.payload);
      });
  }
});

export default templatesSlice.reducer;
