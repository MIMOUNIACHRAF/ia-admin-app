import { configureStore } from "@reduxjs/toolkit";
import agentsReducer from "../features/agents/agentsSlice";
import templatesReducer from "../features/templates/templatesSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

const persistConfig = { key: "root", storage, whitelist: ["agents", "templates"] };

const rootReducer = {
  agents: agentsReducer,
  templates: templatesReducer,
};

const persistedReducer = persistReducer(persistConfig, combineReducers(rootReducer));

const store = configureStore({ reducer: persistedReducer });
export const persistor = persistStore(store);
export default store;
