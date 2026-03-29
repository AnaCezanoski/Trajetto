import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';


export default function ProfileScreen() {
  const { logout } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const countries = [
      'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile',
      'Colombia', 'France', 'Germany', 'Italy', 'Japan',
      'Mexico', 'Portugal', 'Spain', 'United Kingdom',
      'United States',
    ];

  useEffect(() => {
    api.get('/user/me').then((res) => {
      const u = res.data;
      setFirstName(u.firstName);
      setLastName(u.lastName);
      setEmail(u.email);
      setBirthDate(u.birthDate);
      setCountry(u.country);
      setTelephone(u.telephone);
    });
  }, []);

    const formatDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate) {
          setDate(selectedDate);
          setBirthDate(formatDate(selectedDate));
        }
      };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const response = await api.put('/user/me', { firstName, lastName, email, birthDate, country, telephone });
      console.log('RESPONSE:', JSON.stringify(response.data));
      Alert.alert('Success', 'Profile updated!');
    } catch (error: any) {
      console.log('ERROR UPDATE:', JSON.stringify(error.response?.data));
      console.log('STATUS:', error.response?.status);
      console.log('BODY SENT:', JSON.stringify({ firstName, lastName, email, birthDate, country, telephone }));
      Alert.alert('Error', 'Unable to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.actionIcon}>👤</Text>
      <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.input, styles.rowInput]}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={birthDate ? styles.inputText : styles.inputPlaceholder}>
            {birthDate ? birthDate : 'Birth Date'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder="Phone Number"
          value={telephone}
          onChangeText={setTelephone}
          keyboardType="phone-pad"
        />
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onChangeDate}
        />
      )}
      <TextInput style={styles.input} placeholder="Email" value={email}
        onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowCountries(!showCountries)}
          activeOpacity={0.7}
        >
          <Text style={country ? styles.inputText : styles.inputPlaceholder}>
            {country ? country : 'Country'}
          </Text>
        </TouchableOpacity>

        {showCountries && (
          <View style={styles.dropdownList}>
            <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 180 }}>
              {countries.map((item, index) => (
                <TouchableOpacity
                  key={`country-${index}`}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCountry(item);
                    setShowCountries(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#023665' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#023665', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { marginTop: 20, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontWeight: 'bold' },
  inputText: {fontSize: 16, color: '#000', paddingVertical: 2,},
      inputPlaceholder: {fontSize: 16, color: '#aaa', paddingVertical: 2,},row: {flexDirection: 'row',gap: 10, marginBottom: 12,}, rowInput: {
      flex: 1, marginBottom: 0, }, dropdownWrapper: {position: 'relative',zIndex: 10,marginBottom: 12,},
       dropdownList: {position: 'absolute',top: 50,left: 0,right: 0,backgroundColor: '#fff',borderWidth: 1,borderColor: '#ddd',borderRadius: 8,zIndex: 20,elevation: 5,
         shadowColor: '#000',shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.1,shadowRadius: 4,},
       dropdownItem: {paddingVertical: 12,paddingHorizontal: 16,borderBottomWidth: 1,borderBottomColor: '#f0f0f0',},
       dropdownItemText: {fontSize: 16,color: '#000',}, actionIcon: { textAlign: 'center', fontSize: 100, marginBottom: 24 },
});