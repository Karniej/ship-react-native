import { NavigatorScreenParams } from "expo-router/react-navigation";

export type RootStackParamList = {
  "(app)": NavigatorScreenParams<AppStackParamList>;
  "(auth)": NavigatorScreenParams<AuthStackParamList>;
  modal: { id: string };
};

export type AppStackParamList = {
  "(tabs)": NavigatorScreenParams<TabStackParamList>;
  settings: undefined;
  profile: { userId: string };
  notifications: undefined;
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  "forgot-password": undefined;
  "reset-password": { token: string };
};

export type TabStackParamList = {
  index: undefined;
  search: undefined;
  messages: undefined;
  profile: undefined;
};
