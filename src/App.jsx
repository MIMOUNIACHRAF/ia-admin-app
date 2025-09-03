import React from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import AppRoutes from "./routes/routes";
import AppInitializer from "./AppInitializer";
import store from "./store";
function App() {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <AppInitializer>
            <AppRoutes />
          </AppInitializer>
        </BrowserRouter>
      </Provider>
    </React.StrictMode>
  );
}

export default App;
