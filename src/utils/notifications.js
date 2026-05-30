import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { auth, db } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Export a named constant or helper
export const registerForPushNotificationsAsync = async () => {
// Declare a constant or variable
  let token;

  // CRITICAL: Remote notifications are NOT supported in Expo Go for Android (SDK 53+)
// Control flow statement
  if (Constants.appOwnership === 'expo' && Platform.OS === 'android') {
    console.warn("Push Notifications are disabled: Not supported in Expo Go on Android. Use a Development Build to test.");
// Return a value from the function
    return null;
  }

// Control flow statement
  if (Platform.OS === "android") {
// Wait for an asynchronous operation
    await Notifications.setNotificationChannelAsync("default", {
// Style object property
      name: "default",
// Style object property
      importance: Notifications.AndroidImportance.MAX,
// Style object property
      vibrationPattern: [0, 250, 250, 250],
// Style object property
      lightColor: "#FF231F7C",
    });
  }

// Control flow statement
  if (Device.isDevice) {
// Declare a constant or variable
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
// Declare a constant or variable
    let finalStatus = existingStatus;
// Control flow statement
    if (existingStatus !== "granted") {
// Declare a constant or variable
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
// Control flow statement
    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!");
      return;
    }

// Control flow statement
    try {
// Declare a constant or variable
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      
// Control flow statement
      if (!projectId) {
        console.log("EAS Project ID not found. Push tokens may not work in development without EAS configuration.");
      }

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Push Token:", token);

      // Save token to user profile if logged in
// Control flow statement
      if (auth.currentUser) {
// Wait for an asynchronous operation
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
// Style object property
          pushToken: token,
        });
      }
    } catch (e) {
      console.error("Error fetching push token", e);
    }
  } else {
    console.log("Must use physical device for Push Notifications");
  }

// Return a value from the function
  return token;
};

// Export a named constant or helper
export const sendLocalNotification = async (title, body, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // send immediately
  });
};
