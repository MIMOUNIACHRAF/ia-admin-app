import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

// --- CREATE / UPDATE / DELETE QUESTIONS ---
export const createQuestion = createAsyncThunk(
  "questions/create",
  async ({ templateId, questionData }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/V1/templates/${templateId}/import-questions/`, { questions: [questionData] });
      // backend retourne juste le nombre de questions créées, on peut injecter un id fictif si nécessaire
      return { ...questionData, id: res.data.createdId || Date.now(), template: templateId };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateQuestion = createAsyncThunk(
  "questions/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/V1/questions_reponses/${id}/`, data);
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
      await api.delete(`/V1/questions_reponses/${id}/`);
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
      .addCase(createQuestion.fulfilled, (state, action) => { state.list.push(action.payload); })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const idx = state.list.findIndex(q => q.id === action.payload.id);
        if (idx >= 0) state.list[idx] = action.payload;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.list = state.list.filter(q => q.id !== action.payload);
      });
  }
});

export default questionsSlice.reducer;
