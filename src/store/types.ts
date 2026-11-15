/** @format */

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
  createdAt: string;
  lastPremiumCheck: number;
}

// Onboarding Types
export interface UserOnboardingData {
  name?: string;
  preferences?: any;
  theme?: "light" | "dark";
  [key: string]: any;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle?: string;
  type: "welcome" | "input" | "selection" | "permission" | "completion";
  component?: React.ComponentType<any>;
  validation?: (data: any) => boolean;
  optional?: boolean;
}

// Premium Types
export interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    price: number;
    title: string;
    description: string;
  };
}

// Session Types
export interface Session {
  id: string;
  name: string;
  duration: number;
  createdAt: string;
  data?: any;
}

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

// Settings Types
export interface NotificationSettings {
  pushNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  reminderNotificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface GeneralSettings {
  isCelsius: boolean;
  language: string;
  theme: "light" | "dark" | "system";
}

// Store State Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface OnboardingState {
  isOnboardingCompleted: boolean;
  hasSeenPremiumScreen: boolean;
  currentSlideIndex: number;
  userData: UserOnboardingData;
}

export interface PremiumState {
  isLoading: boolean;
  offerings: PurchasesPackage[];
  selectedOffering: PurchasesPackage | null;
  error: string | null;
}

export interface SettingsState {
  theme: "light" | "dark" | "system";
  language: string;
  notificationsEnabled: boolean;
}

export interface GeneralState extends GeneralSettings {}

export interface NotificationState extends NotificationSettings {}

export interface SessionsState {
  sessions: Session[];
  currentSession: Session | null;
}
