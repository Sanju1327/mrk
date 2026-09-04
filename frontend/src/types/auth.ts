export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  githubUsername: string | null;
  bio: string | null;
  roles: string[];
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  timestamp: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}
