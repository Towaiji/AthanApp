import * as Notifications from 'expo-notifications';

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: requestStatus } = await Notifications.requestPermissionsAsync();
    return requestStatus === 'granted';
  }
  return true;
}

export async function schedulePrayerNotifications(prayerTimes: Record<string, string>) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return;
  }

  const now = new Date();

  await Promise.all(
    Object.entries(prayerTimes).map(async ([prayer, time]) => {
      const [hour, minute] = time.split(':').map(Number);
      const trigger = new Date(now);
      trigger.setHours(hour, minute, 0, 0);
      if (trigger < now) {
        trigger.setDate(trigger.getDate() + 1);
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayer} Prayer`,
          body: `It's time for ${prayer}`,
        },
        trigger,
      });
    })
  );
}
