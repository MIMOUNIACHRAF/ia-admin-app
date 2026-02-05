import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";

// CREATE
export const createQuestion = createAsyncThunk(
  "questions/create",
  async ({ templateId, questionData }, { rejectWithValue }) => {
    try {
      const res = await api.post(
        `/V1/templates/${templateId}/import-questions/`,
        { questions: [questionData] }
      );

      // ⚠️ ADAPTE SELON TON API
      return res.data.questions?.[0] || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// UPDATE
export const updateQuestion = createAsyncThunk(
  "questions/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/V1/questions_reponses/${id}/`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// DELETE
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
  initialState: { loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createQuestion.pending, (state) => {
        state.loading = true;
      })
      .addCase(createQuestion.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateQuestion.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteQuestion.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default questionsSlice.reducer;
