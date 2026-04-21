// RegisterScreen.tsx
import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Alert,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import RegisterIllustration from '../components/RegisterIllustration';
import {
  maskName, maskBirthDate, maskTelephone,
  validateRegisterForm, toBirthDateISO, passwordStrength,
} from '../utils/validators';
import { Modal, FlatList } from 'react-native';
import { countries } from '../utils/countries';

const PRIMARY = '#023665';
const PLACEHOLDER = '#9ca3af';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const strength = passwordStrength(password);

  const inputStyle = (field: string) => [
    styles.input,
    errors[field] ? styles.inputError : null,
  ];

  const handleRegister = async () => {
    const errs = validateRegisterForm({ firstName, lastName, birthDate, telephone, email, country, password });
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    try {
      setLoading(true);
      await register({ firstName, lastName, email, password, birthDate: toBirthDateISO(birthDate), country, telephone });
      Alert.alert('Sucesso', 'Conta criada! Faça login');
      router.push('/LoginScreen');
    } catch {
      Alert.alert('Erro', 'Não foi possível criar a conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>

        <View style={styles.illustrationWrap}>
          <RegisterIllustration width={320} height={140} />
        </View>

        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Preencha seus dados para começar</Text>

        <View style={styles.card}>

          <View style={styles.row}>
            <Field label="Nome" error={errors.firstName}>
              <TextInput
                style={inputStyle('firstName')}
                placeholder="Ex: João"
                placeholderTextColor={PLACEHOLDER}
                value={firstName}
                onChangeText={(t) => { setFirstName(maskName(t)); if (errors.firstName) setErrors(p => ({ ...p, firstName: '' })); }}
                autoCapitalize="words"
              />
            </Field>
            <Field label="Sobrenome" error={errors.lastName}>
              <TextInput
                style={inputStyle('lastName')}
                placeholder="Ex: Silva"
                placeholderTextColor={PLACEHOLDER}
                value={lastName}
                onChangeText={(t) => { setLastName(maskName(t)); if (errors.lastName) setErrors(p => ({ ...p, lastName: '' })); }}
                autoCapitalize="words"
              />
            </Field>
          </View>

          <View style={styles.row}>
            <Field label="Data de nascimento" error={errors.birthDate}>
              <TextInput
                style={inputStyle('birthDate')}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={PLACEHOLDER}
                value={birthDate}
                onChangeText={(t) => { setBirthDate(maskBirthDate(t)); if (errors.birthDate) setErrors(p => ({ ...p, birthDate: '' })); }}
                keyboardType="numeric"
                maxLength={10}
              />
            </Field>
            <Field label="Telefone" error={errors.telephone}>
              <TextInput
                style={inputStyle('telephone')}
                placeholder="(00) 00000-0000"
                placeholderTextColor={PLACEHOLDER}
                value={telephone}
                onChangeText={(t) => { setTelephone(maskTelephone(t)); if (errors.telephone) setErrors(p => ({ ...p, telephone: '' })); }}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </Field>
          </View>

          <Field label="E-mail" error={errors.email}>
            <TextInput
              style={inputStyle('email')}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={PLACEHOLDER}
              value={email}
              onChangeText={(t) => { setEmail(t); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Field>

          <Field label="País" error={errors.country}>
            <TouchableOpacity
              style={[styles.dropdownTrigger, errors.country ? styles.inputError : null]}
              onPress={() => setShowCountries(true)}
              activeOpacity={0.7}
            >
              <Text style={country ? styles.dropdownValue : styles.dropdownPlaceholder}>
                {country || 'Selecione seu país'}
              </Text>
              <Text style={styles.dropdownChevron}>▼</Text>
            </TouchableOpacity>
          </Field>

          {/* Modal do país — fora do card, sem problema de overflow */}
          <Modal
            visible={showCountries}
            transparent
            animationType="slide"
            onRequestClose={() => setShowCountries(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowCountries(false)}
            >
              <View style={styles.modalSheet}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Selecione o país</Text>
                <FlatList
                  data={countries}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setCountry(item);
                        setShowCountries(false);
                        if (errors.country) setErrors(p => ({ ...p, country: '' }));
                      }}
                    >
                      <Text style={[styles.modalItemText, country === item && styles.modalItemSelected]}>
                        {item}
                      </Text>
                      {country === item && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          <Field label="Senha" error={errors.password}>
            <View style={[styles.passwordWrapper, errors.password ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={PLACEHOLDER}
                value={password}
                onChangeText={(t) => { setPassword(t); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? (
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={PLACEHOLDER} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke={PLACEHOLDER} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                ) : (
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12A18.45 18.45 0 0 1 5.06 5.06M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12A18.5 18.5 0 0 1 20.71 15.68M14.12 14.12A3 3 0 1 1 9.88 9.88" stroke={PLACEHOLDER} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <Path d="M1 1L23 23" stroke={PLACEHOLDER} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                )}
              </TouchableOpacity>
            </View>
            {password.length > 0 && (
              <View style={styles.strengthRow}>
                <View style={[styles.strengthBar, strength.length ? styles.strengthOk : styles.strengthWeak]}/>
                <View style={[styles.strengthBar, strength.uppercase && strength.lowercase ? styles.strengthOk : styles.strengthWeak]}/>
                <View style={[styles.strengthBar, strength.number ? styles.strengthOk : styles.strengthWeak]}/>
                <View style={[styles.strengthBar, strength.special ? styles.strengthOk : styles.strengthWeak]}/>
              </View>
            )}
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
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  row: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11, fontSize: 15, color: '#1a1a1a' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, marginTop: 4, marginLeft: 2 },
  //dropdownWrapper: { position: 'relative', zIndex: 10 },
  dropdownTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11 },
  dropdownValue: { fontSize: 15, color: '#1a1a1a', flex: 1 },
  dropdownPlaceholder: { fontSize: 15, color: PLACEHOLDER, flex: 1 },
  dropdownChevron: { fontSize: 10, color: '#9ca3af', marginLeft: 8 },
  //dropdownList: { position: 'absolute', top: 46, left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, zIndex: 20, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
  //dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  //dropdownItemText: { fontSize: 15, color: '#1a1a1a' },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 13 },
  passwordInput: { flex: 1, paddingVertical: 11, fontSize: 15, color: '#1a1a1a' },
  eyeBtn: { paddingLeft: 10, paddingVertical: 4 },
  strengthRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthOk: { backgroundColor: '#22c55e' },
  strengthWeak: { backgroundColor: '#ddd' },
  button: { backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 15, alignItems: 'center', shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5, marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loginLink: { alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: '#6b7280' },
  loginLinkBold: { color: PRIMARY, fontWeight: '700' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalItemText: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  modalItemSelected: {
    color: PRIMARY,
    fontWeight: '700',
  },
  checkmark: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: 'bold',
  },
});