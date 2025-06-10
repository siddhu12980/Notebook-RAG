import api from "./api";

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpData {
  email: string;
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

/**
 * Sign in a user with email and password
 */
export const signIn = async (
  credentials: SignInCredentials
): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/signin", credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to sign in");
  }
};

/**
 * Sign up a new user
 */
export const signUp = async (userData: SignUpData): Promise<AuthResponse> => {
  try {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to sign up");
  }
};

/**
 * Get the current user profile
 */
export const getCurrentUser = async (): Promise<any> => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to get user profile");
  }
};
