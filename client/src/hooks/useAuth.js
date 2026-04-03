import { useContext, createContext } from 'react';

export const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};