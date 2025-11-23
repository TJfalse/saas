import { useEffect } from "react";
import { useAuthStore, useDataStore } from "@/store";

/**
 * AuthInitializer - Ensures auth state is properly loaded on app startup
 * This component runs once when the app mounts and validates/restores auth state
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    const authStore = useAuthStore.getState();
    const dataStore = useDataStore.getState();

    // Restore auth state
    const savedAccessToken = localStorage.getItem("accessToken");
    const savedRefreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");
    const savedTenantId = localStorage.getItem("tenantId");
    const savedBranchId = localStorage.getItem("branchId");

    if (savedAccessToken && savedRefreshToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        authStore.setTokens(savedAccessToken, savedRefreshToken);
        authStore.setUser(user);

        // Restore tenant and branch data
        const tenantIdToSet = savedTenantId || user.tenantId;
        const branchIdToSet = savedBranchId || user.branchId;

        if (tenantIdToSet) {
          dataStore.setTenantId(tenantIdToSet);
        }
        if (branchIdToSet) {
          dataStore.setBranchId(branchIdToSet);
        }
      } catch (e) {
        // If parsing fails, clear auth
        authStore.logout();
      }
    }
  }, []);

  return <>{children}</>;
};
