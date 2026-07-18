import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import TanstackProvider from "./lib/QueryClientProvider.tsx";
import ThemeProvider from "./components/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <TanstackProvider>
      <App />
    </TanstackProvider>
  </ThemeProvider>,
);
