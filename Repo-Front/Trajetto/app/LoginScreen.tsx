import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { api } from '../services/api';
import TrajettoLogo from '../components/TrajettoLogo';
import Svg, { Path } from 'react-native-svg';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Fill in all the fields');
    try {
      setLoading(true);
      await login({ email, password });
    } catch (error: any) {
      console.log('STATUS:', error.response?.status);
      console.log('MESSAGE:', error.message);
      Alert.alert('Error', 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // ✅ styles AQUI dentro da função, antes do return
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
      backgroundColor: '#fff',
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 32,
    },
    input: {
      borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
      padding: 12, marginBottom: 12, fontSize: 16,
    },
    button: {
      backgroundColor: '#023665', padding: 14,
      borderRadius: 8, alignItems: 'center', marginTop: 8,
    },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    link: { textAlign: 'center', marginTop: 16, color: '#023665' },
    passwordWrapper: {
      flexDirection: 'row', alignItems: 'center',
      borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
      marginBottom: 12, paddingHorizontal: 12,
    },
    passwordInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
    eyeBtn: { paddingLeft: 8, justifyContent: 'center', alignItems: 'center' },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <TrajettoLogo width={600} height={300} />
        </View>

        <TextInput style={styles.input} placeholder="Email" value={email}
          onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn} activeOpacity={0.7}>
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

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/RegisterScreen')}>
          <Text style={styles.link}>Don't have an account? Sign up</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,          // ← flexGrow no contentContainerStyle do ScrollView
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, marginBottom: 12, fontSize: 16,
  },
  button: {
    backgroundColor: '#023665', padding: 14,
    borderRadius: 8, alignItems: 'center', marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16, color: '#023665' },
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    marginBottom: 12, paddingHorizontal: 12,
  },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  eyeBtn: { paddingLeft: 8, justifyContent: 'center', alignItems: 'center' },
});