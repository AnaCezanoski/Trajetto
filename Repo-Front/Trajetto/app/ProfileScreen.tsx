// ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  maskName, maskBirthDate, maskTelephone,
  validateProfileForm, toBirthDateISO, fromBirthDateISO,
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

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [country, setCountry] = useState('');
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showCountries, setShowCountries] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get('/user/me').then((res) => {
      const u = res.data;
      setFirstName(u.firstName ?? '');
      setLastName(u.lastName ?? '');
      setEmail(u.email ?? '');
      setBirthDate(u.birthDate ? fromBirthDateISO(u.birthDate) : '');
      setCountry(u.country ?? '');
      setTelephone(u.telephone ?? '');
    }).finally(() => setFetching(false));
  }, []);

  const inputStyle = (field: string) => [
    styles.input,
    errors[field] ? styles.inputError : null,
  ];

  const handleUpdate = async () => {
    const errs = validateProfileForm({ firstName, lastName, birthDate, telephone, email, country });
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    try {
      setLoading(true);
      await api.put('/user/me', { firstName, lastName, email, birthDate: toBirthDateISO(birthDate), country, telephone });
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <View style={styles.loadingCenter}><ActivityIndicator size="large" color={PRIMARY} /></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>

        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.avatarName}>{firstName} {lastName}</Text>
          <Text style={styles.avatarEmail}>{email}</Text>
        </View>

        <Text style={styles.sectionTitle}>Informações pessoais</Text>

        <View style={styles.card}>

          <View style={styles.row}>
            <Field label="Nome" error={errors.firstName}>
              <TextInput
                style={inputStyle('firstName')}
                placeholder="Seu nome"
                placeholderTextColor={PLACEHOLDER}
                value={firstName}
                onChangeText={(t) => { setFirstName(maskName(t)); if (errors.firstName) setErrors(p => ({ ...p, firstName: '' })); }}
                autoCapitalize="words"
              />
            </Field>
            <Field label="Sobrenome" error={errors.lastName}>
              <TextInput
                style={inputStyle('lastName')}
                placeholder="Seu sobrenome"
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
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveButtonText}>Salvar alterações</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f4f6f9' },
  loadingCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f6f9' },
  content: { padding: 24, paddingBottom: 48 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  avatarEmoji: { fontSize: 40 },
  avatarName: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 },
  avatarEmail: { fontSize: 13, color: '#6b7280' },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
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
  saveButton: { backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 15, alignItems: 'center', shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5, marginBottom: 16, minHeight: 50, justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutBtn: { alignItems: 'center', paddingVertical: 12 },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },

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