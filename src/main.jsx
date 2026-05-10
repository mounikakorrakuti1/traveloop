import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthBootstrap } from "@/components/layout/AuthBootstrap";
import { ToastProvider } from "@/components/shared/toast-context";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { queryClient } from "@/lib/queryClient";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

async function prepare() {
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }
}

void prepare().then(() => {
  createRoot(rootEl).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <AuthBootstrap>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </AuthBootstrap>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
});
