import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import TanstackProvider from "./lib/QueryClientProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <TanstackProvider>
    <App />
  </TanstackProvider>,
);
