import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'english' | 'arabic' | 'urdu' | 'french' | 'turkish';

const translations = {
  english: {
    settings: 'Settings',
    notifications: 'Notifications',
    enableNotifications: 'Enable Notifications',
    prayerAlerts: 'Prayer Time Alerts',
    reminderBeforePrayer: 'Reminder before prayer',
    calculationMethod: 'Calculation Method',
    prayerCalculation: 'Prayer Calculation',
    darkMode: 'Dark Mode',
    appearance: 'Appearance',
    language: 'Language',
    appLanguage: 'App Language',
    locationSettings: 'Location Settings',
    useAutoLocation: 'Use Auto-location',
    setManualLocation: 'Set Manual Location',
    aboutSupport: 'About & Support',
    aboutThisApp: 'About this App',
    helpSupport: 'Help & Support',
    saveSettings: 'Save Settings',
    resetDefault: 'Reset to Default',
    prayerTimes: 'Prayer Times',
    findMosque: 'Find Nearest Mosque',
    qiblaDirection: 'Qibla Direction',
    quran: 'Quran',
    zakat: 'Zakat',
    zakatNotifications: 'Zakat Notifications',
    zakatFrequency: 'Frequency',
    settingsTab: 'Settings',
  },
  arabic: {
    settings: 'الإعدادات',
    notifications: 'الإشعارات',
    enableNotifications: 'تفعيل الإشعارات',
    prayerAlerts: 'تنبيهات الصلاة',
    reminderBeforePrayer: 'تذكير قبل الصلاة',
    calculationMethod: 'طريقة الحساب',
    prayerCalculation: 'حساب الصلاة',
    darkMode: 'الوضع الداكن',
    appearance: 'المظهر',
    language: 'اللغة',
    appLanguage: 'لغة التطبيق',
    locationSettings: 'إعدادات الموقع',
    useAutoLocation: 'الموقع التلقائي',
    setManualLocation: 'تحديد الموقع يدوياً',
    aboutSupport: 'حول والدعم',
    aboutThisApp: 'حول هذا التطبيق',
    helpSupport: 'المساعدة والدعم',
    saveSettings: 'حفظ الإعدادات',
    resetDefault: 'إعادة الضبط',
    prayerTimes: 'مواقيت الصلاة',
    findMosque: 'أقرب مسجد',
    qiblaDirection: 'اتجاه القبلة',
    quran: 'القرآن',
    zakat: 'الزكاة',
    zakatNotifications: 'تنبيهات الزكاة',
    zakatFrequency: 'التكرار',
    settingsTab: 'الإعدادات',
  },
  urdu: {
    settings: 'سیٹنگز',
    notifications: 'اطلاعات',
    enableNotifications: 'اطلاعات فعال کریں',
    prayerAlerts: 'نماز کے انتباہات',
    reminderBeforePrayer: 'نماز سے قبل یاددہانی',
    calculationMethod: 'حساب کا طریقہ',
    prayerCalculation: 'نماز کا حساب',
    darkMode: 'ڈارک موڈ',
    appearance: 'ظاہری شکل',
    language: 'زبان',
    appLanguage: 'ایپ کی زبان',
    locationSettings: 'مقام کی سیٹنگز',
    useAutoLocation: 'خودکار مقام استعمال کریں',
    setManualLocation: 'مقام دستی طور پر سیٹ کریں',
    aboutSupport: 'ایپ کے بارے میں اور سپورٹ',
    aboutThisApp: 'ایپ کے بارے میں',
    helpSupport: 'مدد اور سپورٹ',
    saveSettings: 'سیٹنگز محفوظ کریں',
    resetDefault: 'ڈیفالٹ پر ری سیٹ',
    prayerTimes: 'نماز کے اوقات',
    findMosque: 'قریبی مسجد تلاش کریں',
    qiblaDirection: 'سمت قبلہ',
    quran: 'قرآن',
    zakat: 'زکوٰۃ',
    zakatNotifications: 'زکوٰۃ کی اطلاعات',
    zakatFrequency: 'تکرار',
    settingsTab: 'سیٹنگز',
  },
  french: {
    settings: 'Paramètres',
    notifications: 'Notifications',
    enableNotifications: 'Activer les notifications',
    prayerAlerts: 'Alertes de prière',
    reminderBeforePrayer: 'Rappel avant la prière',
    calculationMethod: 'Méthode de calcul',
    prayerCalculation: 'Calcul de la prière',
    darkMode: 'Mode sombre',
    appearance: 'Apparence',
    language: 'Langue',
    appLanguage: "Langue de l'app", 
    locationSettings: 'Paramètres de localisation',
    useAutoLocation: 'Utiliser la localisation auto',
    setManualLocation: 'Définir la localisation',
    aboutSupport: 'À propos et support',
    aboutThisApp: 'À propos de cette app',
    helpSupport: 'Aide et support',
    saveSettings: 'Sauvegarder',
    resetDefault: 'Réinitialiser',
    prayerTimes: 'Heures de prière',
    findMosque: 'Mosquée la plus proche',
    qiblaDirection: 'Direction de la Qibla',
    quran: 'Coran',
    zakat: 'Zakat',
    zakatNotifications: 'Notifications de zakat',
    zakatFrequency: 'Fréquence',
    settingsTab: 'Paramètres',
  },
  turkish: {
    settings: 'Ayarlar',
    notifications: 'Bildirimler',
    enableNotifications: 'Bildirimleri etkinleştir',
    prayerAlerts: 'Namaz uyarıları',
    reminderBeforePrayer: 'Namazdan önce hatırlatma',
    calculationMethod: 'Hesaplama yöntemi',
    prayerCalculation: 'Namaz hesaplama',
    darkMode: 'Karanlık mod',
    appearance: 'Görünüm',
    language: 'Dil',
    appLanguage: 'Uygulama dili',
    locationSettings: 'Konum ayarları',
    useAutoLocation: 'Otomatik konum kullan',
    setManualLocation: 'Manuel konum ayarla',
    aboutSupport: 'Hakkında ve destek',
    aboutThisApp: 'Uygulama hakkında',
    helpSupport: 'Yardım ve destek',
    saveSettings: 'Ayarları kaydet',
    resetDefault: 'Varsayılanlara dön',
    prayerTimes: 'Namaz Vakitleri',
    findMosque: 'En Yakın Cami',
    qiblaDirection: 'Kıble Yönü',
    quran: 'Kur’an',
    zakat: 'Zekat',
    zakatNotifications: 'Zekat Bildirimleri',
    zakatFrequency: 'Siklik',
    settingsTab: 'Ayarlar',
  },
} as const;

type Translations = typeof translations.english;

interface LanguageContextData {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextData>({
  language: 'english',
  setLanguage: () => {},
  t: (key: keyof Translations) => translations.english[key],
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('english');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem('language');
        if (saved) {
          setLanguageState(saved as Language);
        }
      } catch (e) {
        console.error('Failed to load language', e);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem('language', lang).catch((e) =>
      console.error('Failed to save language', e)
    );
  };

  const t = (key: keyof Translations) => {
    return translations[language][key] || translations.english[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

