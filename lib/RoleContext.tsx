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

  // Load from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem("userRole") as UserRole;
    const savedTechId = localStorage.getItem("technicianId");
    
    if (savedRole) setRole(savedRole);
    if (savedTechId) setTechnicianId(savedTechId);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem("userRole", role);
    if (technicianId) {
      localStorage.setItem("technicianId", technicianId);
    } else {
      localStorage.removeItem("technicianId");
    }
  }, [role, technicianId]);

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
