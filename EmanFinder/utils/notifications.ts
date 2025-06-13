import * as Notifications from 'expo-notifications';

export type PrayerTimes = Record<string, string>;

export async function schedulePrayerNotifications(prayerTimes: PrayerTimes, reminderMinutes: number) {
  await Notifications.requestPermissionsAsync();

  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  for (const prayer of prayers) {
    const time = prayerTimes[prayer];
    if (!time) continue;
    const [hourStr, minuteStr] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hourStr), parseInt(minuteStr) - reminderMinutes, 0, 0);
    if (date <= new Date()) {
      date.setDate(date.getDate() + 1);
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${prayer} Prayer`,
        body: `It's time for ${prayer} prayer`,
      },
      trigger: date,
    });
  }
}

const frequencySeconds: Record<string, number> = {
  daily: 60 * 60 * 24,
  weekly: 60 * 60 * 24 * 7,
  biweekly: 60 * 60 * 24 * 14,
  monthly: 60 * 60 * 24 * 30,
  yearly: 60 * 60 * 24 * 365,
};

export async function scheduleZakatNotification(frequency: string) {
  await Notifications.requestPermissionsAsync();
  const seconds = frequencySeconds[frequency] || frequencySeconds.daily;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Zakat Reminder',
      body: 'Remember to give your Zakat.',
    },
    trigger: { seconds, repeats: true },
  });
}
