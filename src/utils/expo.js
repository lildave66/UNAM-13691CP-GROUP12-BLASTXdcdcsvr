import Constants from "expo-constants";
import { Platform } from "react-native";

export const getExpoRuntimeInfo = () => ({
  appOwnership: Constants?.appOwnership ?? "unknown",
  isExpoGo: Constants?.appOwnership === "expo",
  isDevelopmentBuild: Constants?.appOwnership === "standalone",
  isWeb: Platform.OS === "web",
  platform: Platform.OS,
});

export const isExpoGoEnvironment = () => getExpoRuntimeInfo().isExpoGo;

export const isNativeExpoRuntime = () => Platform.OS !== "web";
