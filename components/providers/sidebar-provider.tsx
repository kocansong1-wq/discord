"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface SidebarContextType {
  showRightSidebar: boolean;
  setShowRightSidebar: (show: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  showRightSidebar: true,
  setShowRightSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  return (
    <SidebarContext.Provider value={{ showRightSidebar, setShowRightSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
