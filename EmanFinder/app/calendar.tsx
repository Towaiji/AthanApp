import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Colors } from '../constants/colors';

interface HijriDate {
  day: number;
  month: number;
  year: number;
}

const monthNames = [
  '',
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  'Dhu al-Qadah',
  'Dhu al-Hijjah',
];

const events = [
  { month: 9, day: 1, name: 'Start of Ramadan' },
  { month: 9, day: 27, name: 'Laylat al-Qadr' },
  { month: 10, day: 1, name: 'Eid al-Fitr' },
  { month: 12, day: 9, name: 'Day of Arafah' },
  { month: 12, day: 10, name: 'Eid al-Adha' },
];

const getCurrentHijriDate = async (): Promise<HijriDate> => {
  const today = new Date();
  const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
  const res = await fetch(`https://api.aladhan.com/v1/gToH?date=${dateStr}`);
  const data = await res.json();
  const hijri = data.data.hijri;
  return {
    day: parseInt(hijri.day, 10),
    month: hijri.month.number,
    year: parseInt(hijri.year, 10),
  };
};

export default function IslamicCalendarScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const [upcoming, setUpcoming] = useState<{ name: string; date: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const today = await getCurrentHijriDate();
        const list = events.map((ev) => {
          let year = today.year;
          if (ev.month < today.month || (ev.month === today.month && ev.day < today.day)) {
            year += 1;
          }
          const date = `${ev.day} ${monthNames[ev.month]} ${year} AH`;
          return { name: ev.name, date };
        });
        setUpcoming(list);
      } catch (err) {
        console.error('Error fetching events', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>{t('upcomingEvents')}</Text>
      {upcoming.map((ev) => (
        <View key={ev.name} style={styles.eventItem}>
          <Text style={styles.eventName}>{ev.name}</Text>
          <Text style={styles.eventDate}>{ev.date}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 16, textAlign: 'center' },
    eventItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 12, borderRadius: 8, marginBottom: 12 },
    eventName: { fontSize: 16, color: colors.text },
    eventDate: { fontSize: 16, color: colors.textSecondary },
  });
