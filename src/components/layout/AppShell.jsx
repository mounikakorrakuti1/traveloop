import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

/** Wraps all authenticated pages: Navbar + page outlet */
export function AppShell() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
