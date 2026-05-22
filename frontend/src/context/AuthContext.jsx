import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(localStorage.getItem("dazling_token"));
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  // Restore user from localStorage on mount
  useEffect(() => {
    if (token) {
      const stored = localStorage.getItem("dazling_user");
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch (_) {}
      } else {
        // token exists but no cached user — fetch from /auth/me
        authAPI.getMe()
          .then(u => { setUser(u); localStorage.setItem("dazling_user", JSON.stringify(u)); })
          .catch(() => { setToken(null); localStorage.removeItem("dazling_token"); });
      }
    }
  }, []);

  const _persist = (access_token, user) => {
    setToken(access_token);
    setUser(user);
    localStorage.setItem("dazling_token", access_token);
    localStorage.setItem("dazling_user", JSON.stringify(user));
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Backend returns: { access_token, token_type, user }
      const data = await authAPI.login(email, password);
      _persist(data.access_token, data.user);
      return { success: true };
    } catch (err) {
      setError(err.message || "Login failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Backend returns: { access_token, token_type, user }
      const data = await authAPI.register(name, email, password);
      _persist(data.access_token, data.user);
      return { success: true };
    } catch (err) {
      setError(err.message || "Registration failed");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("dazling_token");
    localStorage.removeItem("dazling_user");
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      login, register, logout,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
