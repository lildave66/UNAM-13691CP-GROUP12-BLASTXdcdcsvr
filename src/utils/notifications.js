
export const registerForPushNotificationsAsync = async () => {
  console.log("[Notifications] Push notifications are currently disabled for stability.");
  return null;
};

export const sendLocalNotification = async (title, body, data = {}) => {
  console.log("[Notifications] Local notification skipped:", title);
  return;
};
