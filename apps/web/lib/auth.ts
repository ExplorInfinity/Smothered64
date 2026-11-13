
export interface AuthUser {
  id: string;
  displayName: string;
  kind: "guest" | "registered";
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

const API_URL =
  process.env.NEXT_PUBLIC_GAME_SERVER_URL ??
  "http://localhost:3001";

export const AUTH_TOKEN_KEY = "smothered:auth-token";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(
    `${API_URL}/api/v1/auth${endpoint}`,
    options,
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.message === "string"
        ? data.message
        : "Authentication request failed",
    );
  }

  return data as T;
}

// Register a new user
export function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthSession> {
  return request<AuthSession>("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });
}

// Login an existing user
export function loginUser(
  email: string,
  password: string,
): Promise<AuthSession> {
  return request<AuthSession>("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

// Continue as guest
export function createGuestSession(): Promise<AuthSession> {
  return request<AuthSession>("/guest", {
    method: "POST",
  });
}

// Restore the currently authenticated user
export async function getCurrentUser(
  token: string,
): Promise<AuthUser> {
  const response = await request<{ user: AuthUser }>("/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.user;
}
