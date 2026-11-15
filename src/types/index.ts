export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Settings {
  theme: "light" | "dark" | "system";
  language: string;
  notificationsEnabled: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface FileUpload {
  uri: string;
  type: string;
  name: string;
  size: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}
