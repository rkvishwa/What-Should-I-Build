"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type WorkspaceLayoutContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const WorkspaceLayoutContext =
  createContext<WorkspaceLayoutContextValue | null>(null);

export function WorkspaceLayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(
    () => setSidebarOpen((open) => !open),
    [],
  );

  return (
    <WorkspaceLayoutContext.Provider
      value={{ sidebarOpen, setSidebarOpen, toggleSidebar }}
    >
      {children}
    </WorkspaceLayoutContext.Provider>
  );
}

export function useWorkspaceLayout(): WorkspaceLayoutContextValue {
  const context = useContext(WorkspaceLayoutContext);
  if (!context) {
    return {
      sidebarOpen: true,
      setSidebarOpen: () => {},
      toggleSidebar: () => {},
    };
  }
  return context;
}
