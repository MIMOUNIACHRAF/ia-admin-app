// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import agentsReducer from "../features/agents/agentsSlice.js";

export const store = configureStore({
  reducer: {
    agents: agentsReducer,
  },
});
