import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { api } from '../services/api';
import { useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) {
      return Alert.alert('Attention', 'Enter your email');
    }

    try {
      setLoading(true);

      await api.post('/user/password/forgot', { email });

      Alert.alert(
        'Code sent!',
        'Check your email and enter the code on the next screen.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.push({
                pathname: '/ResetPasswordScreen',
                params: { email }
              })
          }
        ]
      );

    } catch {
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

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

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
  }
});