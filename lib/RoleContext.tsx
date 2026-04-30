"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "OPERATOR" | "TECHNICIAN";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  technicianId: string | null;
  setTechnicianId: (id: string | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("OPERATOR");
  const [technicianId, setTechnicianId] = useState<string | null>(null);

  // Use a second effect or just handle the initialization once
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as UserRole;
    const savedTechId = localStorage.getItem("technicianId");
    
    queueMicrotask(() => {
      if (savedRole) setRole(savedRole);
      if (savedTechId) setTechnicianId(savedTechId);
      setIsHydrated(true);
    });
  }, []);

  // Save to localStorage when changed, but only after initial hydration
  useEffect(() => {
    if (!isHydrated) return;
    
    localStorage.setItem("userRole", role);
    if (technicianId) {
      localStorage.setItem("technicianId", technicianId);
    } else {
      localStorage.removeItem("technicianId");
    }
  }, [role, technicianId, isHydrated]);

  return (
    <RoleContext.Provider value={{ role, setRole, technicianId, setTechnicianId }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
