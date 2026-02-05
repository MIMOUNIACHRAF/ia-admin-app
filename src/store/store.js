import { configureStore, combineReducers } from "@reduxjs/toolkit";
import agentsReducer from "../features/agents/agentsSlice";
import templatesReducer from "../features/templates/templatesSlice";
import questionsReducer from "../features/questions/questionsSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = { key: "root", storage, whitelist: ["agents", "templates"] };

const rootReducer = combineReducers({
  agents: agentsReducer,
  templates: templatesReducer,
  questions: questionsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({ reducer: persistedReducer });
export const persistor = persistStore(store);
export default store;
