// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import AppRoutes from "./routes/routes";
import AppInitializer from "./AppInitializer";
import store from "./store";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppInitializer>
          <AppRoutes />
        </AppInitializer>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
