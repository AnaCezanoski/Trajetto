import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import RegisterIllustration from '../components/RegisterIllustration';
import Svg, { Path } from 'react-native-svg';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountries, setShowCountries] = useState(false);

  const countries = [
    'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile',
    'Colombia', 'France', 'Germany', 'Italy', 'Japan',
    'Mexico', 'Portugal', 'Spain', 'United Kingdom', 'United States',
  ];

  const handleBirthDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 3 && cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else if (cleaned.length >= 5) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
    setBirthDate(formatted);
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !birthDate || !country || !telephone) {
      return Alert.alert('Attention', 'Please fill in all fields');
    }
    const [day, month, year] = birthDate.split('/');
    if (!day || !month || !year || year.length < 4) {
      return Alert.alert('Attention', 'Enter a valid date (DD/MM/YYYY)');
    }
    const formattedDate = `${year}-${month}-${day}`;
    try {
      setLoading(true);
      await register({ firstName, lastName, email, password, birthDate: formattedDate, country, telephone });
      Alert.alert('Success', 'Account created! Please log in');
      router.push('/LoginScreen');
    } catch {
      Alert.alert('Error', 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <RegisterIllustration width={400} height={177} />
        </View>

        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Birth Date"
            value={birthDate}
            onChangeText={handleBirthDate}
            keyboardType="numeric"
            maxLength={10}
          />
          <TextInput
            style={[styles.input, styles.rowInput]}
            placeholder="Phone Number"
            value={telephone}
            onChangeText={setTelephone}
            keyboardType="phone-pad"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

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

        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                  stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            ) : (
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 5.06 5.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 20.71 15.68M14.12 14.12A3 3 0 1 1 9.88 9.88"
                  stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <Path d="M1 1L23 23"
                  stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/LoginScreen')} style={{ marginTop: 16 }}>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#023665' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: '#023665', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', color: '#023665' },
  inputText: { fontSize: 16, color: '#000', paddingVertical: 2 },
  inputPlaceholder: { fontSize: 16, color: '#aaa', paddingVertical: 2 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 0 },
  rowInput: { flex: 1, marginBottom: 12 },
  dropdownWrapper: { position: 'relative', zIndex: 10, marginBottom: 12 },
  dropdownList: {
    position: 'absolute', top: 50, left: 0, right: 0,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, zIndex: 20, elevation: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownItemText: { fontSize: 16, color: '#000' },
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    marginBottom: 12, paddingHorizontal: 12,
  },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  eyeBtn: { paddingLeft: 8, justifyContent: 'center', alignItems: 'center' },
});