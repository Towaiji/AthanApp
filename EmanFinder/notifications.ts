import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;
  if (finalStatus !== 'granted') {
    const request = await Notifications.requestPermissionsAsync();
    finalStatus = request.status;
  }
  return finalStatus === 'granted';
};

export const schedulePrayerNotifications = async (
  prayerTimes: Record<string, string>,
  reminderMinutes: number
) => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  for (const prayer of prayers) {
    const time = prayerTimes[prayer];
    if (!time) continue;
    const [hour, minute] = time.split(':').map((v) => parseInt(v, 10));
    const trigger = new Date();
    trigger.setHours(hour, minute, 0, 0);
    if (reminderMinutes > 0) {
      trigger.setMinutes(trigger.getMinutes() - reminderMinutes);
    }
    if (trigger < now) trigger.setDate(trigger.getDate() + 1);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Prayer Reminder',
        body: `Time for ${prayer}`,
      },
      trigger,
    });
  }
};
