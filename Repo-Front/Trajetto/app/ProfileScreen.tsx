import React, { useEffect, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

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

  useEffect(() => {
    api.get('/user/me').then((res) => {
      const u = res.data;
      setFirstName(u.firstName ?? '');
      setLastName(u.lastName ?? '');
      setEmail(u.email ?? '');
      if (u.birthDate) {
        const [year, month, day] = u.birthDate.split('-');
        setBirthDate(`${day}/${month}/${year}`);
      }
      setCountry(u.country ?? '');
      setTelephone(u.telephone ?? '');
    }).finally(() => setFetching(false));
  }, []);

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

  const handleUpdate = async () => {
    const [day, month, year] = birthDate.split('/');
    if (!day || !month || !year || year.length < 4) {
      return Alert.alert('Atenção', 'Data inválida (DD/MM/AAAA)');
    }
    try {
      setLoading(true);
      await api.put('/user/me', {
        firstName, lastName, email,
        birthDate: `${year}-${month}-${day}`,
        country, telephone,
      });
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

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
        {/* Avatar */}
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
            <Field label="Nome">
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor={PLACEHOLDER}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </Field>
            <Field label="Sobrenome">
              <TextInput
                style={styles.input}
                placeholder="Seu sobrenome"
                placeholderTextColor={PLACEHOLDER}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </Field>
          </View>

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
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarEmoji: { fontSize: 40 },
  avatarName: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 },
  avatarEmail: { fontSize: 13, color: '#6b7280' },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },

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
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

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
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemText: { fontSize: 15, color: '#1a1a1a' },

  saveButton: {
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
    minHeight: 50,
    justifyContent: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  logoutBtn: { alignItems: 'center', paddingVertical: 12 },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
});
