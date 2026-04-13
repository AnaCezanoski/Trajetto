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
  Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import RegisterIllustration from '../components/RegisterIllustration';

const PRIMARY = '#023665';
const PLACEHOLDER = '#9ca3af';

const countries = [
  'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile',
  'Colombia', 'France', 'Germany', 'Italy', 'Japan',
  'Mexico', 'Portugal', 'Spain', 'United Kingdom', 'United States',
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

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
      return Alert.alert('Atenção', 'Preencha todos os campos');
    }
    const [day, month, year] = birthDate.split('/');
    if (!day || !month || !year || year.length < 4) {
      return Alert.alert('Atenção', 'Data inválida (DD/MM/AAAA)');
    }
    try {
      setLoading(true);
      await register({
        firstName, lastName, email, password,
        birthDate: `${year}-${month}-${day}`, country, telephone,
      });
      Alert.alert('Sucesso', 'Conta criada! Faça login');
      router.push('/LoginScreen');
    } catch {
      Alert.alert('Erro', 'Não foi possível criar a conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <View style={styles.illustrationWrap}>
          <RegisterIllustration width={320} height={140} />
        </View>

        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Preencha seus dados para começar</Text>

        <View style={styles.card}>
          {/* Nome / Sobrenome */}
          <View style={styles.row}>
            <Field label="Nome">
              <TextInput
                style={styles.input}
                placeholder="Ex: João"
                placeholderTextColor={PLACEHOLDER}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </Field>
            <Field label="Sobrenome">
              <TextInput
                style={styles.input}
                placeholder="Ex: Silva"
                placeholderTextColor={PLACEHOLDER}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </Field>
          </View>

          {/* Data / Telefone */}
          <View style={styles.row}>
            <Field label="Data de nascimento">
              <TextInput
                style={styles.input}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={PLACEHOLDER}
                value={birthDate}
                onChangeText={handleBirthDate}
                keyboardType="numeric"
                maxLength={10}
              />
            </Field>
            <Field label="Telefone">
              <TextInput
                style={styles.input}
                placeholder="+55 11 9..."
                placeholderTextColor={PLACEHOLDER}
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="phone-pad"
              />
            </Field>
          </View>

          {/* Email */}
          <Field label="E-mail">
            <TextInput
              style={styles.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={PLACEHOLDER}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Field>

          {/* País */}
          <Field label="País">
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setShowCountries(!showCountries)}
                activeOpacity={0.7}
              >
                <Text style={country ? styles.dropdownValue : styles.dropdownPlaceholder}>
                  {country || 'Selecione seu país'}
                </Text>
                <Text style={styles.dropdownChevron}>{showCountries ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showCountries && (
                <View style={styles.dropdownList}>
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 180 }}>
                    {countries.map((item, i) => (
                      <TouchableOpacity
                        key={i}
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
          </Field>

          {/* Senha */}
          <Field label="Senha">
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={PLACEHOLDER}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? (
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                      stroke={PLACEHOLDER} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                      stroke={PLACEHOLDER} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                ) : (
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 5.06 5.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 20.71 15.68M14.12 14.12A3 3 0 1 1 9.88 9.88"
                      stroke={PLACEHOLDER} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <Path d="M1 1L23 23" stroke={PLACEHOLDER} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </TouchableOpacity>
            </View>
          </Field>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{loading ? 'Criando conta...' : 'Criar Conta'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/LoginScreen')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Já tem conta? <Text style={styles.loginLinkBold}>Entrar</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f4f6f9' },
  content: { padding: 24, paddingBottom: 48 },

  illustrationWrap: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: PRIMARY, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  row: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },

  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1a1a1a',
  },

  dropdownWrapper: { position: 'relative', zIndex: 10 },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  dropdownValue: { fontSize: 15, color: '#1a1a1a', flex: 1 },
  dropdownPlaceholder: { fontSize: 15, color: PLACEHOLDER, flex: 1 },
  dropdownChevron: { fontSize: 10, color: '#9ca3af', marginLeft: 8 },
  dropdownList: {
    position: 'absolute', top: 46, left: 0, right: 0,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 10, zIndex: 20, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  dropdownItemText: { fontSize: 15, color: '#1a1a1a' },

  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 13,
  },
  passwordInput: { flex: 1, paddingVertical: 11, fontSize: 15, color: '#1a1a1a' },
  eyeBtn: { paddingLeft: 10, paddingVertical: 4 },

  button: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  loginLink: { alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: '#6b7280' },
  loginLinkBold: { color: PRIMARY, fontWeight: '700' },
});
