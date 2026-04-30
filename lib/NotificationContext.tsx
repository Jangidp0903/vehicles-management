"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import NotificationModal, { NotificationType } from "@/components/NotificationModal";

interface NotificationState {
  isOpen: boolean;
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationContextType {
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showLoading: (title: string, message: string) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NotificationState>({
    isOpen: false,
    type: null,
    title: "",
    message: "",
  });

  const showSuccess = (title: string, message: string) => {
    setState({ isOpen: true, type: "success", title, message });
  };

  const showError = (title: string, message: string) => {
    setState({ isOpen: true, type: "error", title, message });
  };

  const showLoading = (title: string, message: string) => {
    setState({ isOpen: true, type: "loading", title, message });
  };

  const hideNotification = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showLoading, hideNotification }}>
      {children}
      <NotificationModal
        isOpen={state.isOpen}
        type={state.type}
        title={state.title}
        message={state.message}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
