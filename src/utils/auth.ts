import type { NavigateFunction } from "react-router-dom";

export const getApiUrl = () => import.meta.env.VITE_API_URL || "/api";

export const clearAuthData = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("role");
};

export const logoutAndRedirect = (navigate: NavigateFunction, message?: string) => {
  clearAuthData();
  if (message) {
    alert(message);
  }
  navigate("/");
};

export const verifyAuthToken = async (navigate: NavigateFunction): Promise<boolean> => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    logoutAndRedirect(navigate);
    return false;
  }

  try {
    const response = await fetch(`${getApiUrl()}/devices/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (!response.ok) {
      logoutAndRedirect(navigate, "Session expired or backend unavailable. Please login again.");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Auth validation failed:", error);
    logoutAndRedirect(navigate, "Unable to connect to server. Please login again once the backend is available.");
    return false;
  }
};
