  import { configureStore } from "@reduxjs/toolkit";
  import agentsReducer from "../features/agents/agentsSlice";

  export const store = configureStore({
    reducer: { agents: agentsReducer },
  });
