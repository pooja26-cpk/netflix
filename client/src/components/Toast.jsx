import React, { useEffect } from "react";
import { useTheme } from "../hooks/useTheme";

function Toast({ message, type = "success", onClose, duration = 3000 }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "info":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return isDark ? "bg-green-900 border-green-700 text-green-100" : "bg-green-100 border-green-400 text-green-800";
      case "error":
        return isDark ? "bg-red-900 border-red-700 text-red-100" : "bg-red-100 border-red-400 text-red-800";
      case "warning":
        return isDark ? "bg-yellow-900 border-yellow-700 text-yellow-100" : "bg-yellow-100 border-yellow-400 text-yellow-800";
      case "info":
        return isDark ? "bg-blue-900 border-blue-700 text-blue-100" : "bg-blue-100 border-blue-400 text-blue-800";
      default:
        return isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-800";
    }
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${getColors()} animate-slide-in`}
      style={{ animation: "slideIn 0.3s ease-out" }}
    >
      {getIcon()}
      <span className="font-medium text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default Toast;
