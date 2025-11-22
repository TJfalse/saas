import { useEffect } from "react";
import { useAuthStore } from "@/store";

/**
 * AuthInitializer - Ensures auth state is properly loaded on app startup
 * This component runs once when the app mounts and validates/restores auth state
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    const store = useAuthStore.getState();

    // If we have an access token but it's not set in the store, restore it
    const savedAccessToken = localStorage.getItem("accessToken");
    const savedRefreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");

    if (savedAccessToken && savedRefreshToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        store.setTokens(savedAccessToken, savedRefreshToken);
        store.setUser(user);
      } catch (e) {
        // If parsing fails, clear auth
        store.logout();
      }
    }
  }, []);

  return <>{children}</>;
};
