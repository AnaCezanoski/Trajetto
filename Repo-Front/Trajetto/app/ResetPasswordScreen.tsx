import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { api } from '../services/api';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { validateEmail, validatePassword, passwordStrength } from '../utils/validators';
import Svg, { Path } from 'react-native-svg';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState((params.email as string) || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(password);

  const inputStyle = (field: string) => [
    styles.input,
    errors[field] ? styles.inputError : null,
  ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        const emailError = validateEmail(email);
        if (emailError) newErrors.email = emailError;

        if (!code) {
          newErrors.code = 'Code is required';
        } else if (!/^\d{6}$/.test(code)) {
          newErrors.code = 'Code must be exactly 6 digits';
        }

        const passwordError = validatePassword(password);
        if (passwordError) newErrors.password = passwordError;

        return newErrors;
      };


  const handleReset = async () => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    if (!code) newErrors.code = 'Code is required';

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      setLoading(true);

      await api.post('/user/password/reset', {
        email: email.trim().toLowerCase(),
        code,
        newPassword: password
      });

      Alert.alert('Success', 'Password reset!', [
        { text: 'OK', onPress: () => router.replace('/LoginScreen') }
      ]);

    } catch (error: any) {
      console.log('ERROR RESET:', error?.response?.data);
      Alert.alert('Error', 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Reset Password</Text>

        {/* EMAIL */}
        <TextInput
          style={inputStyle('email')}
          placeholder="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
          }}
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* Code */}
      <TextInput
        style={inputStyle('code')}
        placeholder="Code"
        value={code}
        onChangeText={(text) => setCode(text.replace(/\D/g, ''))}
        keyboardType="numeric"
        maxLength={6}
      />
      {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}

        {/* PASSWORD */}
        <View style={[styles.passwordWrapper, errors.password && styles.inputError]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="New Password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
            }}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} activeOpacity={0.7}>
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
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      {/* Indicador de força */}
      {password.length > 0 && (
        <View style={styles.passwordStrength}>
          <View style={[styles.strengthBar, strength.length    ? styles.strengthOk : styles.strengthWeak]}/>
          <View style={[styles.strengthBar, strength.uppercase && strength.lowercase ? styles.strengthOk : styles.strengthWeak]}/>
          <View style={[styles.strengthBar, strength.number    ? styles.strengthOk : styles.strengthWeak]}/>
          <View style={[styles.strengthBar, strength.special   ? styles.strengthOk : styles.strengthWeak]}/>
        </View>
      )}

        <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
          <Text style={styles.buttonText}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: 4
  },

  inputError: {
    borderColor: '#EF4444'
  },

  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4
  },

  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 4,
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
    alignItems: 'center',
    marginTop: 8
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  passwordStrength: {
     flexDirection: 'row',
     gap: 6,
     marginBottom: 12
   },
   strengthBar: {
     flex: 1,
     height: 4,
     borderRadius: 2
   },
   strengthOk: {
     backgroundColor: '#22c55e'
   },
   strengthWeak: {
     backgroundColor: '#ddd'
   },
});