import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Colors } from '../../constants/colors';

const Settings = () => {
  const { colors, isDark, toggleDarkMode } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [prayerAlerts, setPrayerAlerts] = useState(true);
  const [reminderTime, setReminderTime] = useState('15');
  const [zakatNotifications, setZakatNotifications] = useState(false);
  const [zakatFrequency, setZakatFrequency] = useState('monthly');

  // Prayer calculation method
  const [calculationMethod, setCalculationMethod] = useState('MWL');
  const [showMethodPicker, setShowMethodPicker] = useState(false);

  // Appearance handled by theme context

  // Language settings
  const { language, setLanguage, t } = useLanguage();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // Location settings
  const [useAutoLocation, setUseAutoLocation] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem('settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setNotificationsEnabled(parsed.notificationsEnabled ?? true);
          setPrayerAlerts(parsed.prayerAlerts ?? true);
          setReminderTime(parsed.reminderTime ?? '15');
          setCalculationMethod(parsed.calculationMethod ?? 'MWL');
          setLanguage(parsed.language ?? 'english');
          setUseAutoLocation(parsed.useAutoLocation ?? true);
          setZakatNotifications(parsed.zakatNotifications ?? false);
          setZakatFrequency(parsed.zakatFrequency ?? 'monthly');
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    const data = {
      notificationsEnabled,
      prayerAlerts,
      reminderTime,
      calculationMethod,
      language,
      useAutoLocation,
      zakatNotifications,
      zakatFrequency,
    };
    try {
      await AsyncStorage.setItem('settings', JSON.stringify(data));
      Alert.alert('Settings Saved', 'Your preferences have been updated');
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            setNotificationsEnabled(true);
            setPrayerAlerts(true);
            setReminderTime('15');
            setCalculationMethod('MWL');
            setLanguage('english');
            setUseAutoLocation(true);
            setZakatNotifications(false);
            setZakatFrequency('monthly');
            AsyncStorage.setItem(
              'settings',
              JSON.stringify({
                notificationsEnabled: true,
                prayerAlerts: true,
                reminderTime: '15',
                calculationMethod: 'MWL',
                language: 'english',
                useAutoLocation: true,
                zakatNotifications: false,
                zakatFrequency: 'monthly',
              })
            );
            Alert.alert('Settings Reset', 'All settings have been reset to default values');
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{t('settings')}</Text>

      {/* Notifications Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={24} color={colors.accent} />
          <Text style={styles.sectionTitle}>{t('notifications')}</Text>
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>{t('enableNotifications')}</Text>
          <Switch
            onValueChange={() => setNotificationsEnabled(prev => !prev)}
            value={notificationsEnabled}
            trackColor={{ false: "#d3d3d3", true: colors.accent }}
            thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
          />
        </View>

        {notificationsEnabled && (
          <>
            <View style={styles.setting}>
              <Text style={styles.settingText}>{t('prayerAlerts')}</Text>
              <Switch
                onValueChange={() => setPrayerAlerts(prev => !prev)}
                value={prayerAlerts}
                trackColor={{ false: "#d3d3d3", true: colors.accent }}
                thumbColor={prayerAlerts ? "#fff" : "#f4f3f4"}
              />
            </View>

            {prayerAlerts && (
              <View style={styles.setting}>
                <Text style={styles.settingText}>{t('reminderBeforePrayer')}</Text>
                <View style={styles.inlinePickerContainer}>
                  <Picker
                    selectedValue={reminderTime}
                    style={styles.reminderPicker}
                    itemStyle={styles.pickerItem}
                    onValueChange={(itemValue) => setReminderTime(itemValue)}
                    mode="dropdown"
                  >
                  <Picker.Item label={t('immediate')} value="0" />
                  <Picker.Item label={`5 ${t('minutes')}`} value="5" />
                  <Picker.Item label={`15 ${t('minutes')}`} value="15" />
                  <Picker.Item label={`30 ${t('minutes')}`} value="30" />
                  </Picker>
                </View>
              </View>
            )}

            <View style={styles.setting}>
              <Text style={styles.settingText}>{t('zakatNotifications')}</Text>
              <Switch
                onValueChange={() => setZakatNotifications(prev => !prev)}
                value={zakatNotifications}
                trackColor={{ false: "#d3d3d3", true: colors.accent }}
                thumbColor={zakatNotifications ? "#fff" : "#f4f3f4"}
              />
            </View>

            {zakatNotifications && (
              <View style={styles.setting}>
                <Text style={styles.settingText}>{t('zakatFrequency')}</Text>
                <View style={styles.inlinePickerContainer}>
                  <Picker
                    selectedValue={zakatFrequency}
                    style={styles.reminderPicker}
                    itemStyle={styles.pickerItem}
                    onValueChange={(itemValue) => setZakatFrequency(itemValue)}
                    mode="dropdown"
                  >
                    <Picker.Item label="Daily" value="daily" />
                    <Picker.Item label="Weekly" value="weekly" />
                    <Picker.Item label="Biweekly" value="biweekly" />
                    <Picker.Item label="Monthly" value="monthly" />
                    <Picker.Item label="Yearly" value="yearly" />
                  </Picker>
                </View>
              </View>
            )}

          </>
        )}
      </View>

      {/* Prayer Calculation Method */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calculator-outline" size={24} color={colors.accent} />
          <Text style={styles.sectionTitle}>{t('prayerCalculation')}</Text>
        </View>

        <TouchableOpacity
          style={styles.setting}
          onPress={() => setShowMethodPicker(!showMethodPicker)}
        >
          <Text style={styles.settingText}>{t('calculationMethod')}</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>
              {calculationMethod === 'MWL' ? t('methodMWL') :
                calculationMethod === 'ISNA' ? t('methodISNA') :
                  calculationMethod === 'Egyptian' ? t('methodEgyptian') :
                    calculationMethod === 'Karachi' ? t('methodKarachi') :
                      calculationMethod === 'Makkah' ? t('methodMakkah') :
                        t('methodMWL')}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        {showMethodPicker && (
          <View style={styles.expandedSection}>
            <Picker
              selectedValue={calculationMethod}
              style={styles.timePicker}
              itemStyle={styles.pickerItem}
              onValueChange={(itemValue) => {
                setCalculationMethod(itemValue);
                setShowMethodPicker(false);
              }}
            >
              <Picker.Item label={t('methodMWL')} value="MWL" />
              <Picker.Item label={t('methodISNA')} value="ISNA" />
              <Picker.Item label={t('methodEgyptian')} value="Egyptian" />
              <Picker.Item label={t('methodKarachi')} value="Karachi" />
              <Picker.Item label={t('methodMakkah')} value="Makkah" />
            </Picker>
          </View>
        )}
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="color-palette-outline" size={24} color={colors.accent} />
          <Text style={styles.sectionTitle}>{t('appearance')}</Text>
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>{t('darkMode')}</Text>
          <Switch
            onValueChange={toggleDarkMode}
            value={isDark}
            trackColor={{ false: "#d3d3d3", true: colors.accent }}
            thumbColor={isDark ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Language */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="language-outline" size={24} color={colors.accent} />
          <Text style={styles.sectionTitle}>{t('language')}</Text>
        </View>

        <TouchableOpacity
          style={styles.setting}
          onPress={() => setShowLanguagePicker(!showLanguagePicker)}
        >
          <Text style={styles.settingText}>{t('language')}</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>
              {language === 'english' ? 'English' :
                language === 'arabic' ? 'العربية' :
                language === 'urdu' ? 'اردو' :
                language === 'french' ? 'Français' :
                language === 'turkish' ? 'Türkçe' :
                language === 'indonesian' ? 'Bahasa Indonesia' :
                language === 'malay' ? 'Bahasa Melayu' :
                language === 'spanish' ? 'Español' :
                'English'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        {showLanguagePicker && (
          <View style={styles.expandedSection}>
            <Picker
              selectedValue={language}
              style={styles.timePicker}
              itemStyle={styles.pickerItem}
              onValueChange={(itemValue) => {
                setLanguage(itemValue);
                setShowLanguagePicker(false);
              }}
            >
              <Picker.Item label="English" value="english" />
              <Picker.Item label="العربية (Arabic)" value="arabic" />
              <Picker.Item label="اردو (Urdu)" value="urdu" />
              <Picker.Item label="Français (French)" value="french" />
              <Picker.Item label="Türkçe (Turkish)" value="turkish" />
              <Picker.Item label="Bahasa Indonesia" value="indonesian" />
              <Picker.Item label="Bahasa Melayu" value="malay" />
              <Picker.Item label="Español (Spanish)" value="spanish" />
            </Picker>
          </View>
        )}
      </View>

      {/* Location */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={24} color={colors.accent} />
          <Text style={styles.sectionTitle}>{t('locationSettings')}</Text>
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>{t('useAutoLocation')}</Text>
          <Switch
            onValueChange={() => setUseAutoLocation(prev => !prev)}
            value={useAutoLocation}
            trackColor={{ false: "#d3d3d3", true: colors.accent }}
            thumbColor={useAutoLocation ? "#fff" : "#f4f3f4"}
          />
        </View>

        {!useAutoLocation && (
          <TouchableOpacity
            style={styles.setting}
            onPress={() => Alert.alert('Set Manual Location', 'This would open a location picker')}
          >
            <Text style={styles.settingText}>{t('setManualLocation')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* About & Support */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={24} color={colors.accent} />
          <Text style={styles.sectionTitle}>{t('aboutSupport')}</Text>
        </View>

        <TouchableOpacity
          style={styles.setting}
          onPress={() => Alert.alert('About', 'Islamic Prayer App v1.0.0')}
        >
          <Text style={styles.settingText}>{t('aboutThisApp')}</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.setting}
          onPress={() => Alert.alert('Help & Support', 'For assistance, please contact support@prayerapp.com')}
        >
          <Text style={styles.settingText}>{t('helpSupport')}</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveSettings}
        >
          <Text style={styles.buttonText}>{t('saveSettings')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetToDefaults}
        >
          <Text style={[styles.buttonText, styles.resetButtonText]}>{t('resetDefault')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Islamic Prayer App • v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
    color: colors.text,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: colors.text,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingText: {
    fontSize: 16,
    color: colors.text,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 5,
  },
  expandedSection: {
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlinePickerContainer: {
    width: 150,
  },
  reminderPicker: {
    width: '100%',
    height: 200,
    color: colors.text,
  },
  timePicker: {
    width: '100%',
    height: 150,
    color: colors.text,
    backgroundColor: 'transparent',
  },
  pickerItem: {
    color: colors.picker,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: colors.accent,
  },
  resetButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resetButtonText: {
    color: colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default Settings;

