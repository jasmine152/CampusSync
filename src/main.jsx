import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const darkMode =
  localStorage.getItem("darkMode") === "true";


if (darkMode) {

  document.body.classList.add("dark");

}
createRoot(
  document.getElementById("root")
).render(

  <StrictMode>

    <BrowserRouter>

      <AuthProvider>

        <App />

      </AuthProvider>

    </BrowserRouter>

  </StrictMode>

);