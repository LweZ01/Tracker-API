import { useState, useEffect } from "react";
import * as authService from "../services/authService.js";
import { refreshAccessToken } from "../services/api.js";
import { AuthContext } from "./AuthContextInstance.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        await refreshAccessToken();
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await authService.login({ email, password });
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      setUser(null);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async ({ name, email, password }) => {
    setIsLoading(true);
    try {
      // POST /auth/signup solo crea la cuenta, no devuelve accessToken.
      // Para dejar al usuario autenticado tras registrarse, hacemos
      // login inmediatamente después con las mismas credenciales.
      await authService.signup({ name, email, password });
      const data = await authService.login({ email, password });
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      setUser(null);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedUserData }));
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
