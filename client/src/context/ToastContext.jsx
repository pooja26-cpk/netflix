import React, { useState, useCallback } from "react";
import Toast from "../components/Toast";
import { ToastContext } from "../hooks/useToast";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Helper methods for common toast types
  const success = useCallback((message, duration) => {
    showToast(message, "success", duration);
  }, [showToast]);

  const error = useCallback((message, duration) => {
    showToast(message, "error", duration);
  }, [showToast]);

  const warning = useCallback((message, duration) => {
    showToast(message, "warning", duration);
  }, [showToast]);

  const info = useCallback((message, duration) => {
    showToast(message, "info", duration);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div className="fixed top-0 right-0 z-50">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
