import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { api } from '../services/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState(params.email || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async () => {
    if (!email || !code || !password) {
      return Alert.alert('Fill in all the fields');
    }

    try {
      await api.post('/user/password/reset', {
        email,
        code,
        newPassword: password
      });

      Alert.alert('Success', 'Password reset!', [
        { text: 'OK', onPress: () => router.replace('/LoginScreen') }
      ]);

    } catch {
      Alert.alert('Error', 'Invalid or expired code');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset password</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Code"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
      />

      {/* 🔥 senha com olho funcionando */}
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          placeholder="New Password"
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

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#023665'
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },

  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12
  },

  eyeBtn: {
    paddingLeft: 8
  },

  button: {
    backgroundColor: '#023665',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});