import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

// Fetch questions par template
export const fetchQuestionsByTemplate = createAsyncThunk(
  "questions/fetchByTemplate",
  async (templateId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/V1/templates/${templateId}/`);
      return res.data.questions_reponses || [];
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// CRUD questions individuelles
export const createQuestion = createAsyncThunk(
  "questions/create",
  async ({ templateId, questionData }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/V1/templates/${templateId}/import-questions/`, { questions: [questionData] });
      return { ...questionData, id: res.data.createdId }; // adapter selon backend
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateQuestion = createAsyncThunk(
  "questions/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/V1/questions/${id}/`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteQuestion = createAsyncThunk(
  "questions/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/V1/questions/${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const questionsSlice = createSlice({
  name: "questions",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestionsByTemplate.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchQuestionsByTemplate.fulfilled, (state, action) => { state.loading = false; state.list = action.payload; })
      .addCase(fetchQuestionsByTemplate.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createQuestion.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const idx = state.list.findIndex(q => q.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.list = state.list.filter(q => q.id !== action.payload);
      });
  },
});

export default questionsSlice.reducer;
