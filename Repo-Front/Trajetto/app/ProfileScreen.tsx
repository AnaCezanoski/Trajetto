import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { maskName, maskBirthDate, maskTelephone, validateProfileForm, toBirthDateISO, fromBirthDateISO } from '../utils/validators';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const countries = [
    'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile',
    'Colombia', 'France', 'Germany', 'Italy', 'Japan',
    'Mexico', 'Portugal', 'Spain', 'United Kingdom', 'United States',
  ];

  useEffect(() => {
    api.get('/user/me').then((res) => {
      const u = res.data;
      setFirstName(u.firstName ?? '');
      setLastName(u.lastName ?? '');
      setEmail(u.email ?? '');
      setBirthDate(u.birthDate ? fromBirthDateISO(u.birthDate) : '');
      setCountry(u.country ?? '');
      setTelephone(u.telephone ?? '');
    });
  }, []);

  const handleUpdate = async () => {
    const errs = validateProfileForm({ firstName, lastName, birthDate, telephone, email, country });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      setLoading(true);
      await api.put('/user/me', {
        firstName, lastName, email,
        birthDate: toBirthDateISO(birthDate),
        country, telephone,
      });
      Alert.alert('Success', 'Profile updated!');
    } catch (error: any) {
      console.log('ERROR UPDATE:', JSON.stringify(error.response?.data));
      console.log('ERROR UPDATE FULL:', error);
      console.log('ERROR DATA:', error.response?.data);
      console.log('ERROR STATUS:', error.response?.status);
      Alert.alert('Error', 'Unable to update');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => [
    styles.input,
    errors[field] ? styles.inputError : null,
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.actionIcon}>👤</Text>

        {/* First Name */}
        <TextInput
          style={inputStyle('firstName')}
          placeholder="First Name"
          value={firstName}
          onChangeText={(t) => setFirstName(maskName(t))}
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

        {/* Last Name */}
        <TextInput
          style={inputStyle('lastName')}
          placeholder="Last Name"
          value={lastName}
          onChangeText={(t) => setLastName(maskName(t))}
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

        {/* Birth Date + Phone */}
        <View style={styles.row}>
          <View style={styles.rowInput}>
            <TextInput
              style={[inputStyle('birthDate'), { marginBottom: 0 }]}
              placeholder="DD/MM/YYYY"
              value={birthDate}
              onChangeText={(t) => setBirthDate(maskBirthDate(t))}
              keyboardType="numeric"
              maxLength={10}
            />
            {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
          </View>

          <View style={styles.rowInput}>
            <TextInput
              style={[inputStyle('telephone'), { marginBottom: 0 }]}
              placeholder="(00) 00000-0000"
              value={telephone}
              onChangeText={(t) => setTelephone(maskTelephone(t))}
              keyboardType="phone-pad"
              maxLength={15}
            />
            {errors.telephone && <Text style={styles.errorText}>{errors.telephone}</Text>}
          </View>
        </View>

        <View style={{ marginBottom: 12 }} />

        {/* Email */}
        <TextInput
          style={inputStyle('email')}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        {/* Country */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={[styles.input, errors.country ? styles.inputError : null]}
            onPress={() => setShowCountries(!showCountries)}
            activeOpacity={0.7}
          >
            <Text style={country ? styles.inputText : styles.inputPlaceholder}>
              {country ? country : 'Country'}
            </Text>
          </TouchableOpacity>
          {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}

          {showCountries && (
            <View style={styles.dropdownList}>
              <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 180 }}>
                {countries.map((item, index) => (
                  <TouchableOpacity
                    key={`country-${index}`}
                    style={styles.dropdownItem}
                    onPress={() => { setCountry(item); setShowCountries(false); }}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: '#023665' },
  actionIcon: { textAlign: 'center', fontSize: 80, marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 4, fontSize: 16 },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 8, marginLeft: 4 },
  button: { backgroundColor: '#023665', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { marginTop: 20, alignItems: 'center' },
  logoutText: { color: '#EF4444', fontWeight: 'bold' },
  inputText: { fontSize: 16, color: '#000', paddingVertical: 2 },
  inputPlaceholder: { fontSize: 16, color: '#aaa', paddingVertical: 2 },
  row: { flexDirection: 'row', gap: 10 },
  rowInput: { flex: 1 },
  dropdownWrapper: { position: 'relative', zIndex: 10, marginBottom: 4 },
  dropdownList: {
    position: 'absolute', top: 50, left: 0, right: 0,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, zIndex: 20, elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownItemText: { fontSize: 16, color: '#000' },
});