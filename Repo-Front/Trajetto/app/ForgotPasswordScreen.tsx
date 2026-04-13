import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { api } from '../services/api';
import { useRouter } from 'expo-router';
import { validateEmail } from '../utils/validators'; // ✅ IMPORT CORRETO

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputStyle = (field: string) => [
    styles.input,
    errors[field] ? styles.inputError : null,
  ];

  const handleSend = async () => {
    const error = validateEmail(email);

    if (error) {
      setErrors({ email: error });
      return;
    }

    setErrors({});

    try {
      setLoading(true);

      await api.post('/user/password/forgot', {
        email: email.trim().toLowerCase() // ✅ PADRONIZA IGUAL REGISTER
      });

      Alert.alert(
        'Code sent!',
        'Check your email and enter the code on the next screen.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.push({
                pathname: '/ResetPasswordScreen',
                params: { email: email.trim().toLowerCase() }
              })
          }
        ]
      );

    } catch (error: any) {
      console.log('ERROR FORGOT:', error?.response?.data);
      Alert.alert('Error', 'Could not send code. Check if the email is registered.');
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
        <Text style={styles.title}>Forgot Password</Text>

        <Text style={styles.subtitle}>
          Enter your email and we'll send you a verification code.
        </Text>

        {/* EMAIL */}
        <TextInput
          style={inputStyle('email')}
          placeholder="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors(prev => ({ ...prev, email: '' })); // ✅ limpa erro ao digitar
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Sending...' : 'Send Code'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff'
  },
  title: {
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
      color: '#023665'
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16
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
    fontWeight: 'bold',
    fontSize: 16
  },
  link: {
    textAlign: 'center',
    marginTop: 16,
    color: '#023665'
  },
  inputError: { borderColor: '#EF4444' },
    errorText: { color: '#EF4444', fontSize: 12, marginBottom: 8, marginLeft: 4 },
});