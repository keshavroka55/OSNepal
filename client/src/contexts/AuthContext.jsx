
import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "../features/api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => { // wrapper for whole app and provide auth data. 
  const [user, setUser] = useState(null); // setUser: store logged-in user data. 
  const [authChecked, setAuthChecked] = useState(false); // check login state to prevent auth redirect. 
  const navigate = useNavigate();
  const location = useLocation();


  // Auto-login on app load

  const checkAuth = async () => {
    try {
      const response = await api.get("/api/auth/me", {
        validateStatus: (status) => {
          return (status >= 200 && status < 300) || status === 401;
        },
      });

      if (response.status === 401) {
        setUser(null);
        return;
      }

      setUser(response.data);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  };

  // re-run the applications check once when app starts 
  useEffect(() => {
    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      navigate("/login");
    }
  };

  useEffect(() => {
    if (!authChecked) return;

    const exactAuthOnlyRoutes = [
      "/profile/edit",
      "/profile", // own private profile
    ];
    const prefixAuthOnlyRoutes = ["/dashboard"]; // need login for this prefix endpoints. 

    // Returns true when the current path requires authentication
    const isAuthRequired = (pathname) =>
      exactAuthOnlyRoutes.includes(pathname) ||
      prefixAuthOnlyRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));

    // In the redirect effect:
    if (!user) {
      if (isAuthRequired(location.pathname)) navigate("/login"); // guest try to use protected endpoints: red to /login
      return; // guests stay on any other route freely
    }

    // If logged in on the public landing page or register page, redirect by role.
    if
      (location.pathname === "/" || location.pathname === "/register") {
      if (user.role === "admin")
        navigate("/dashboard");
      else
        navigate("/home");
    }
  }, [authChecked, user, location.pathname, navigate]);

  // provide Context (makes it globally: u s l)
  return (
    <AuthContext.Provider
      value={{ user, setUser, logout, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}







/* 
 context is a simple variables: which store this global variables. 
 {
  user,
  setUser,
  logout
} 
  */