import React, { useState } from 'react';
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
import { colors } from '../../constants/colors';

const Settings = () => {
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [prayerAlerts, setPrayerAlerts] = useState(true);
  const [reminderTime, setReminderTime] = useState('15');

  // Prayer calculation method
  const [calculationMethod, setCalculationMethod] = useState('MWL');
  const [showMethodPicker, setShowMethodPicker] = useState(false);

  // Appearance
  const [useDarkMode, setUseDarkMode] = useState(false);

  // Language settings
  const [appLanguage, setAppLanguage] = useState('english');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  // Location settings
  const [useAutoLocation, setUseAutoLocation] = useState(true);

  const handleSaveSettings = () => {
    Alert.alert('Settings Saved', 'Your preferences have been updated');
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
            setUseDarkMode(false);
            setAppLanguage('english');
            setUseAutoLocation(true);
            Alert.alert('Settings Reset', 'All settings have been reset to default values');
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Notifications Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="notifications-outline" size={24} color={colors.accent} />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>Enable Notifications</Text>
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
              <Text style={styles.settingText}>Prayer Time Alerts</Text>
              <Switch
                onValueChange={() => setPrayerAlerts(prev => !prev)}
                value={prayerAlerts}
                trackColor={{ false: "#d3d3d3", true: colors.accent }}
                thumbColor={prayerAlerts ? "#fff" : "#f4f3f4"}
              />
            </View>

            <View style={styles.setting}>
              <Text style={styles.settingText}>Reminder before prayer</Text>
              <View style={styles.inlinePickerContainer}>
                <Picker
                  selectedValue={reminderTime}
                  style={styles.reminderPicker}   
                  itemStyle={styles.pickerItem}   
                  onValueChange={(itemValue) => setReminderTime(itemValue)}
                  mode="dropdown"
                >
                  <Picker.Item label="5 minutes" value="5" />
                  <Picker.Item label="10 minutes" value="10" />
                  <Picker.Item label="15 minutes" value="15" />
                  <Picker.Item label="20 minutes" value="20" />
                  <Picker.Item label="30 minutes" value="30" />
                </Picker>
              </View>
            </View>

          </>
        )}
      </View>

      {/* Prayer Calculation Method */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calculator-outline" size={24} color={colors.accent} />
          <Text style={styles.sectionTitle}>Prayer Calculation</Text>
        </View>

        <TouchableOpacity
          style={styles.setting}
          onPress={() => setShowMethodPicker(!showMethodPicker)}
        >
          <Text style={styles.settingText}>Calculation Method</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>
              {calculationMethod === 'MWL' ? 'Muslim World League' :
                calculationMethod === 'ISNA' ? 'ISNA (North America)' :
                  calculationMethod === 'Egyptian' ? 'Egyptian Authority' :
                    calculationMethod === 'Karachi' ? 'University of Karachi' :
                      calculationMethod === 'Makkah' ? 'Umm al-Qura, Makkah' :
                        'Muslim World League'}
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
              <Picker.Item label="Muslim World League" value="MWL" />
              <Picker.Item label="ISNA (North America)" value="ISNA" />
              <Picker.Item label="Egyptian Authority" value="Egyptian" />
              <Picker.Item label="University of Karachi" value="Karachi" />
              <Picker.Item label="Umm al-Qura, Makkah" value="Makkah" />
            </Picker>
          </View>
        )}
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="color-palette-outline" size={24} color={colors.accent} />
          <Text style={styles.sectionTitle}>Appearance</Text>
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch
            onValueChange={() => setUseDarkMode(prev => !prev)}
            value={useDarkMode}
            trackColor={{ false: "#d3d3d3", true: colors.accent }}
            thumbColor={useDarkMode ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Language */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="language-outline" size={24} color={colors.accent} />
          <Text style={styles.sectionTitle}>Language</Text>
        </View>

        <TouchableOpacity
          style={styles.setting}
          onPress={() => setShowLanguagePicker(!showLanguagePicker)}
        >
          <Text style={styles.settingText}>App Language</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>
              {appLanguage === 'english' ? 'English' :
                appLanguage === 'arabic' ? 'العربية' :
                  appLanguage === 'urdu' ? 'اردو' :
                    appLanguage === 'french' ? 'Français' :
                      appLanguage === 'turkish' ? 'Türkçe' :
                        'English'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        {showLanguagePicker && (
          <View style={styles.expandedSection}>
            <Picker
              selectedValue={appLanguage}
              style={styles.timePicker}
              itemStyle={styles.pickerItem}
              onValueChange={(itemValue) => {
                setAppLanguage(itemValue);
                setShowLanguagePicker(false);
              }}
            >
              <Picker.Item label="English" value="english" />
              <Picker.Item label="العربية (Arabic)" value="arabic" />
              <Picker.Item label="اردو (Urdu)" value="urdu" />
              <Picker.Item label="Français (French)" value="french" />
              <Picker.Item label="Türkçe (Turkish)" value="turkish" />
            </Picker>
          </View>
        )}
      </View>

      {/* Location */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={24} color={colors.accent} />
          <Text style={styles.sectionTitle}>Location Settings</Text>
        </View>

        <View style={styles.setting}>
          <Text style={styles.settingText}>Use Auto-location</Text>
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
            <Text style={styles.settingText}>Set Manual Location</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* About & Support */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle-outline" size={24} color={colors.accent} />
          <Text style={styles.sectionTitle}>About & Support</Text>
        </View>

        <TouchableOpacity
          style={styles.setting}
          onPress={() => Alert.alert('About', 'Islamic Prayer App v1.0.0')}
        >
          <Text style={styles.settingText}>About this App</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.setting}
          onPress={() => Alert.alert('Help & Support', 'For assistance, please contact support@prayerapp.com')}
        >
          <Text style={styles.settingText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveSettings}
        >
          <Text style={styles.buttonText}>Save Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetToDefaults}
        >
          <Text style={[styles.buttonText, styles.resetButtonText]}>Reset to Default</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Islamic Prayer App • v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
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
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fefefe',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  expandedSection: {
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
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
    color: '#333333',
  },
  timePicker: {
    width: '100%',
    height: 150,
    color: '#333333',
    backgroundColor: 'transparent',
  },
  pickerItem: {
    color: '#333333',
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
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resetButtonText: {
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default Settings;
