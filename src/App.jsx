import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/routes";
import AppInitializer from "./components/AppInitializer";

function App() {
  return (
    <BrowserRouter>
      <AppInitializer>
        <AppRoutes />
      </AppInitializer>
    </BrowserRouter>
  );
}

export default App;
