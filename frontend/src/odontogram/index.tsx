import React from "react";
import ReactDOM from "react-dom/client";
import Odontogram from "./Components/Odontogram";

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Odontogram />
    </React.StrictMode>
  );
}