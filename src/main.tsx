import React from "react";
import ReactDOM from "react-dom/client";
import Login from "./Login";
import { HashRouter, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter basename= {import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);
