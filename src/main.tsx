import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Login from "./Login";
import { HashRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App /> 
      <Login />
    </HashRouter>
  </React.StrictMode>
);
