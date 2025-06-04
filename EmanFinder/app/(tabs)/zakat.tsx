import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

/**
 * Expanded list of charities (~20 more) across the four causes:
 *   • hunger
 *   • palestine
 *   • quran
 *   • war
 */
const donationOptions: Record<string, { name: string; url: string }[]> = {
  hunger: [
    { name: 'Islamic Relief USA', url: 'https://irusa.org/' },
    { name: 'Muslim Aid', url: 'https://www.muslimaid.org/' },
    { name: 'Penny Appeal USA', url: 'https://pennyappealusa.org/' },
    { name: 'Muslim Hands', url: 'https://muslimhands.org.uk/' },
    { name: 'Zakat Foundation of America', url: 'https://www.zakat.org/' },
    { name: 'Human Appeal USA', url: 'https://humanappeal.org/' },
    { name: 'Islamic Relief UK', url: 'https://www.islamic-relief.org.uk/' },
    { name: 'Access — Agriculture for Life', url: 'https://access-life.org/' },
    { name: 'Anera (American Near East Refugee Aid)', url: 'https://www.anera.org/' },
    { name: 'Mercy-USA for Aid and Development', url: 'https://www.mercyusa.org/' },
    { name: 'Bread for the World', url: 'https://www.bread.org/' },
    { name: 'Feed the Hunger', url: 'https://feedthehunger.org/' }
  ],
  palestine: [
    { name: 'UNRWA', url: 'https://donate.unrwa.org/' },
    { name: 'Human Appeal - Palestine', url: 'https://humanappeal.org.uk/' },
    { name: 'Medical Aid for Palestinians', url: 'https://www.map.org.uk/' },
    { name: 'Islamic Relief Palestine', url: 'https://www.islamic-relief.org/' },
    { name: 'Palestine Children’s Relief Fund', url: 'https://pcrf.net/' },
    { name: 'U.S. Campaign for Palestinian Rights', url: 'https://uscpr.org/' },
    { name: 'Middle East Children’s Alliance', url: 'https://www.mecaforpeace.org/' },
    { name: 'Holy Land Trust', url: 'https://holylandtrust.org/' },
    { name: 'United Palestinian Appeal', url: 'https://upa-pal.org/' },
    { name: 'Life for Relief and Development', url: 'https://lifefrd.org/' }
  ],
  quran: [
    { name: 'Donate Quran Project', url: 'https://www.donatequran.com/' },
    { name: 'Islamic Relief - Quran', url: 'https://www.islamicrelief.org/' },
    { name: 'Quran for All', url: 'https://www.quranforall.org/' },
    { name: 'Quran Literacy Project', url: 'https://www.quranliteracyproject.org/' },
    { name: 'Al-Khair Foundation', url: 'https://alkhair.org/' },
    { name: 'Quranic Open Source Initiative', url: 'https://github.com/quranopensource/' },
    { name: 'TarteeleQuran', url: 'https://tarteelequran.org/' },
    { name: 'Rumi Project', url: 'https://therumiproject.org/' },
    { name: 'Quran Reading Project', url: 'https://quranreading.org/' },
    { name: 'Quran Foundation Canada', url: 'https://quranfoundationcanada.ca/' }
  ],
  war: [
    { name: 'Doctors Without Borders', url: 'https://www.doctorswithoutborders.org/' },
    { name: 'International Rescue Committee', url: 'https://rescue.org/' },
    { name: 'Islamic Relief – Conflict Zones', url: 'https://www.islamic-relief.org/' },
    { name: 'World Central Kitchen', url: 'https://wck.org/' },
    { name: 'CARE (Cooperative for Assistance and Relief Everywhere)', url: 'https://www.care.org/' },
    { name: 'World Food Program USA', url: 'https://www.wfpusa.org/' },
    { name: 'Refugees International', url: 'https://www.refugeesinternational.org/' },
    { name: 'Mercy Corps', url: 'https://www.mercycorps.org/' },
    { name: 'Save the Children – Conflict Response', url: 'https://www.savethechildren.org/' },
    { name: 'Norwegian Refugee Council', url: 'https://www.nrc.no/' }
  ]
};

export default function ZakatScreen() {
  const [cause, setCause] = useState<keyof typeof donationOptions>('hunger');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingVertical: 20 }}>
      <Text style={styles.title}>Find a Charity</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select Cause</Text>
        <Picker
          selectedValue={cause}
          onValueChange={(itemValue) => setCause(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Hunger Relief" value="hunger" />
          <Picker.Item label="Palestine" value="palestine" />
          <Picker.Item label="Donate Qur'an" value="quran" />
          <Picker.Item label="War Relief" value="war" />
        </Picker>
      </View>

      {donationOptions[cause].map((option) => (
        <TouchableOpacity
          key={option.name}
          style={styles.item}
          onPress={() => Linking.openURL(option.url)}
        >
          <Ionicons name="open-outline" size={20} color={colors.accent} style={{ marginRight: 8 }} />
          <Text style={styles.itemText}>{option.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  pickerContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333'
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8
  },
  pickerItem: {
    fontSize: 16,
    color: '#333'
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2
  },
  itemText: {
    fontSize: 16,
    color: '#333'
  }
});
