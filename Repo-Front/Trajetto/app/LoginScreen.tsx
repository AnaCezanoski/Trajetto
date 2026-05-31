import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { validateEmail } from '../utils/validators';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Logo from '../assets/appImgs/logo.svg';

const PRIMARY = '#006ecf';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({}); // Keep errors state for validation messages

  const handleLogin = async () => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    if (!password) newErrors.password = 'Senha é obrigatória';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      setLoading(true);
      await login({ email, password });
    } catch {
      setError('E-mail ou senha inválidos.');
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
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.header}>
          <View>
            <Animated.Text 
              entering={FadeIn.delay(1000).duration(800)}
              style={{fontSize: 12, color: '#e0e5ed', marginBottom: 5, marginLeft: 2}}
            >
              Planeje seu
            </Animated.Text>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
              <Animated.View 
                entering={FadeIn.duration(800)}
                style={styles.logoContainer}
              >
                <Logo width={40} height={40} color={PRIMARY} />
              </Animated.View>
              <Animated.Text 
                entering={SlideInRight.duration(800)}
                style={{fontSize: 30, fontFamily: 'FugazOne', color: 'white'}}
              >
                Trajetto
              </Animated.Text>
            </View>
          </View>
        </View>


        {/* Card de login */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Login</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          ) : null}

          <CustomInput
            label="E-mail"
            type="email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            autoCapitalize="none"
            error={errors.email}
          />

          <CustomInput
            label="Senha"
            type="password"
            value={password}
            onChangeText={setPassword}
              placeholder="••••••••"
            error={errors.password}
          />

          <TouchableOpacity onPress={() => router.push('/ForgotPasswordScreen')}>
            <Text style={styles.link}>Esqueceu sua senha?</Text>
          </TouchableOpacity>
          <CustomButton
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          {/* Link cadastro */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/RegisterScreen')}>
              <Text style={styles.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingBottom: 80,
    backgroundColor: PRIMARY,
  },
  container: {
    flexGrow: 1,
    backgroundColor: PRIMARY,
    paddingTop: 150,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 28,
    paddingBottom: 40,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  cardSub: {
    fontSize: 14,
    color: '#8a9ab0',
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#fff0f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorBoxText: {
    fontSize: 13,
    color: '#c0392b',
  },
  loginBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  registerRow: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: { fontSize: 14, color: '#8a9ab0' },
  registerLink: { fontSize: 14, color: PRIMARY, fontWeight: '700' },
  link: { fontSize: 14, color: PRIMARY, textAlign: 'right', marginBottom: 30 },
});