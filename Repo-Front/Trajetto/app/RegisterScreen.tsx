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
  validateEmail,
  maskName, maskBirthDate, maskTelephone,
  validateRegisterForm, toBirthDateISO, passwordStrength,
} from '../utils/validators';
import { Modal, FlatList } from 'react-native';
import { countries } from '../utils/countries';

const PRIMARY = '#006ecf';
const PLACEHOLDER = '#9ca3af';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../assets/appImgs/logo.svg';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = async () => {
    const errs = validateRegisterForm({ firstName, lastName, birthDate, telephone, email, country, password });
    if (password !== confirmPassword) {
      errs.confirmPassword = 'As senhas não coincidem';
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    try {
      setLoading(true);
      await register({ firstName, lastName, email, password, birthDate: toBirthDateISO(birthDate), country, telephone });
      Alert.alert('Quase lá!', 'Enviamos um código de verificação para o seu email.');

      router.push({
        pathname: '/VerifyEmailScreen',
        params: { email: email }
      });

    } catch {
      Alert.alert('Erro', 'Não foi possível criar a conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>

        <View style={styles.headerWrapper}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={32} color={'white'} />
              </TouchableOpacity>
              <Text style={styles.headerText}>Cadastro</Text>
            </View>

            <View style={styles.headerCenter} pointerEvents="none">
              <View style={{
                alignItems: 'center',
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 5,
              }}>
                <Logo width={20} height={20} color={PRIMARY} />
              </View>
            </View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: 15,
          }}>
            Crie sua conta
          </Text>

          <View style={styles.row}>
            <CustomInput
              label="Nome"
              value={firstName}
              onChangeText={(t) => { setFirstName(maskName(t)); if (errors.firstName) setErrors(p => ({ ...p, firstName: '' })); }}
              placeholder="Ex: João"
              autoCapitalize="words"
              error={errors.firstName}
              style={styles.field}
            />
            <CustomInput
              label="Sobrenome"
              value={lastName}
              onChangeText={(t) => { setLastName(maskName(t)); if (errors.lastName) setErrors(p => ({ ...p, lastName: '' })); }}
              placeholder="Ex: Silva"
              autoCapitalize="words"
              error={errors.lastName}
              style={styles.field}
            />
          </View>

          <View style={styles.row}>
            <CustomInput
              label="Data de nascimento"
              type="numeric"
              value={birthDate}
              onChangeText={(t) => { setBirthDate(maskBirthDate(t)); if (errors.birthDate) setErrors(p => ({ ...p, birthDate: '' })); }}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              error={errors.birthDate}
              style={styles.field}
            />
            <CustomInput
              label="Telefone"
              type="phone-pad"
              value={telephone}
              onChangeText={(t) => { setTelephone(maskTelephone(t)); if (errors.telephone) setErrors(p => ({ ...p, telephone: '' })); }}
              placeholder="(00) 00000-0000"
              maxLength={15}
              error={errors.telephone}
              style={styles.field}
            />
          </View>

          <CustomInput
            label="E-mail"
            type="email"
            value={email}
            onChangeText={(t) => { setEmail(t); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
            placeholder="seuemail@exemplo.com"
            autoCapitalize="none"
            error={errors.email}
          />

          <View style={styles.field}>
            <Text style={styles.label}>País</Text>
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
            {errors.country ? <Text style={styles.errorText}>{errors.country}</Text> : null}
          </View>

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

          <CustomInput
            label="Senha"
            type="password"
            value={password}
            onChangeText={(t) => { setPassword(t); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
            placeholder="Mínimo 8 caracteres"
            error={errors.password}
          />
          {password.length > 0 && ( // Password strength indicator
            <View style={styles.strengthRow}>
              <View style={[styles.strengthBar, passwordStrength(password).length ? styles.strengthOk : styles.strengthWeak]} />
              <View style={[styles.strengthBar, passwordStrength(password).uppercase && passwordStrength(password).lowercase ? styles.strengthOk : styles.strengthWeak]} />
              <View style={[styles.strengthBar, passwordStrength(password).number ? styles.strengthOk : styles.strengthWeak]} />
              <View style={[styles.strengthBar, passwordStrength(password).special ? styles.strengthOk : styles.strengthWeak]} />
            </View>
          )}

          <CustomInput
            label="Repetir Senha"
            type="password"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errors.confirmPassword) setErrors(p => ({ ...p, confirmPassword: '' }));
            }}
            placeholder="Confirme sua senha"
            returnKeyType="done"
            error={errors.confirmPassword}
            inputStyle={confirmPassword.length > 0 && password === confirmPassword ? styles.inputOk : null}
          />

          <CustomButton
            title="Criar Conta"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />

          <TouchableOpacity onPress={() => router.push('/LoginScreen')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Já tem conta? <Text style={styles.loginLinkBold}>Entrar</Text></Text>
          </TouchableOpacity>

        </View>



      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f4f6f9' },
  scrollView: { flex: 1, backgroundColor: '#fff' },
  headerWrapper: { paddingHorizontal: 24, paddingBottom: 40, backgroundColor: PRIMARY },
  content: { paddingBottom: 48 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 70, marginBottom: 20, position: 'relative', height: 44 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  headerBackBtn: { padding: 8, marginLeft: -12 },
  headerText: { fontSize: 18, fontWeight: '700', color: 'white', marginLeft: -4 },
  headerCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', padding: 8, marginLeft: -12, marginBottom: 8 },
  backIcon: { fontSize: 32, color: PRIMARY, fontWeight: '300' },
  illustrationWrap: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: PRIMARY, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 28,
    paddingBottom: 40,
  },
  row: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputOk: { borderColor: '#22c55e' },
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
  strengthRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthOk: { backgroundColor: '#22c55e' },
  strengthWeak: { backgroundColor: '#ddd' },
  button: { backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 15, alignItems: 'center', shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5, marginBottom: 16, marginTop: 20 },
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