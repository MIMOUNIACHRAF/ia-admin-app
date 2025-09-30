// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import store, { persistor } from "./store";
import App from "./App.jsx";
import "./index.css";
import { AgentsProvider } from "./context/AgentsContext";

// Import utilitaire de test auth (dev uniquement)
import "./utils/authTestScript";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AgentsProvider>
          <App />
        </AgentsProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
