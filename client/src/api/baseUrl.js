const LOCAL_API_URL = "http://localhost:5000/api";
const PROD_API_URL = "https://netflix-server-production-4cdc.up.railway.app/api";

const normalizeUrl = (value = "") => value.trim().replace(/\/+$/, "");

export const getApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL?.trim();
  const fallback = import.meta.env.DEV ? LOCAL_API_URL : PROD_API_URL;
  return normalizeUrl(configured || fallback);
};

export const apiUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
};
