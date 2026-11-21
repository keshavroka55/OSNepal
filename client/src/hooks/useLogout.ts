import { useAuth } from "../contexts/AuthContext";
import { logoutAPI } from "../features/auth/authService";


export default function useLogout() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      // Even if API logout fails, clear local auth state so user can exit safely
      console.warn("Logout API failed, continuing with local logout", error);
    } finally {
      logout();
    }
  };

  return handleLogout;
}