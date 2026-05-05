import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator,
  Modal, FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../services/api';
import { countries } from '../utils/countries';

const PRIMARY = '#023665';
const PLACEHOLDER = '#9ca3af';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export default function UserDetailScreen() {
  const { user: userParam } = useLocalSearchParams();
  const user = JSON.parse(userParam as string);
  const router = useRouter();

  const [firstName, setFirstName] = useState(user.firstName ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');
  const [email, setEmail] = useState(user.email ?? '');
  const [birthDate, setBirthDate] = useState(user.birthDate ?? '');
  const [country, setCountry] = useState(user.country ?? '');
  const [telephone, setTelephone] = useState(user.telephone ?? '');
  const [isAdmin, setIsAdmin] = useState<boolean>(user.isAdmin);
  const [loading, setLoading] = useState(false);
  const [showCountries, setShowCountries] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await api.patch(`/user/${user.id}`, { firstName, lastName, email, birthDate, country, telephone });
      Alert.alert('Sucesso', 'Usuário atualizado!');
      router.back();
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newIsAdmin: boolean) => {
    try {
      await api.put(`/user/${user.id}/role`, { isAdmin: newIsAdmin });
      setIsAdmin(newIsAdmin);
    } catch {
      Alert.alert('Erro', 'Não foi possível alterar o cargo.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <Text style={styles.avatarName}>{firstName} {lastName}</Text>
          <Text style={styles.avatarEmail}>{email}</Text>
        </View>

        {/* Dados pessoais */}
        <Text style={styles.sectionTitle}>Informações pessoais</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Field label="Nome">
              <TextInput style={styles.input} placeholder="Nome" placeholderTextColor={PLACEHOLDER} value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
            </Field>
            <Field label="Sobrenome">
              <TextInput style={styles.input} placeholder="Sobrenome" placeholderTextColor={PLACEHOLDER} value={lastName} onChangeText={setLastName} autoCapitalize="words" />
            </Field>
          </View>

          <View style={styles.row}>
            <Field label="Data de nascimento">
              <TextInput style={styles.input} placeholder="AAAA-MM-DD" placeholderTextColor={PLACEHOLDER} value={birthDate} onChangeText={setBirthDate} keyboardType="numeric" />
            </Field>
            <Field label="Telefone">
              <TextInput style={styles.input} placeholder="Telefone" placeholderTextColor={PLACEHOLDER} value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />
            </Field>
          </View>

          <Field label="E-mail">
            <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={PLACEHOLDER} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </Field>

          <Field label="País">
            <TouchableOpacity style={styles.dropdownTrigger} onPress={() => setShowCountries(true)} activeOpacity={0.7}>
              <Text style={country ? styles.dropdownValue : styles.dropdownPlaceholder}>
                {country || 'Selecione o país'}
              </Text>
              <Text style={styles.dropdownChevron}>▼</Text>
            </TouchableOpacity>
          </Field>
        </View>

        {/* Cargo */}
        <Text style={styles.sectionTitle}>Cargo</Text>
        <View style={styles.card}>
          <Text style={styles.roleInfo}>
            Cargo atual: <Text style={styles.roleValue}>{isAdmin ? 'Administrador' : 'Usuário'}</Text>
          </Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleBtn, !isAdmin && styles.roleBtnActive]}
              onPress={() => handleRoleChange(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleBtnText, !isAdmin && styles.roleBtnTextActive]}>👤 Usuário</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleBtn, isAdmin && styles.roleBtnActive]}
              onPress={() => handleRoleChange(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleBtnText, isAdmin && styles.roleBtnTextActive]}>🛡️ Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleUpdate} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.saveButtonText}>Salvar alterações</Text>
          }
        </TouchableOpacity>

      </ScrollView>

      {/* Modal de países */}
      <Modal visible={showCountries} transparent animationType="slide" onRequestClose={() => setShowCountries(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCountries(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Selecione o país</Text>
            <FlatList
              data={countries}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { setCountry(item); setShowCountries(false); }}>
                  <Text style={[styles.modalItemText, country === item && styles.modalItemSelected]}>{item}</Text>
                  {country === item && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#f4f6f9' },
  content: { padding: 24, paddingBottom: 48 },

  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: PRIMARY,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  avatarEmoji: { fontSize: 40 },
  avatarName: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 },
  avatarEmail: { fontSize: 13, color: '#6b7280' },

  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  row: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, marginBottom: 16 },
  fieldLabel: {
    fontSize: 12, fontWeight: '700', color: '#6b7280',
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11,
    fontSize: 15, color: '#1a1a1a',
  },
  dropdownTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0',
    borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11,
  },
  dropdownValue: { fontSize: 15, color: '#1a1a1a', flex: 1 },
  dropdownPlaceholder: { fontSize: 15, color: PLACEHOLDER, flex: 1 },
  dropdownChevron: { fontSize: 10, color: '#9ca3af', marginLeft: 8 },

  roleInfo: { fontSize: 14, color: '#6b7280', marginBottom: 14 },
  roleValue: { color: PRIMARY, fontWeight: '700' },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    alignItems: 'center', backgroundColor: '#f8fafc',
  },
  roleBtnActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  roleBtnText: { fontWeight: '700', color: '#6b7280', fontSize: 14 },
  roleBtnTextActive: { color: '#fff' },

  saveButton: {
    backgroundColor: PRIMARY, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', shadowColor: PRIMARY, shadowOpacity: 0.3,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5,
    minHeight: 50, justifyContent: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 40, maxHeight: '60%',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#e2e8f0',
    borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 },
  modalItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  modalItemText: { fontSize: 15, color: '#1a1a1a' },
  modalItemSelected: { color: PRIMARY, fontWeight: '700' },
  checkmark: { color: PRIMARY, fontSize: 16, fontWeight: 'bold' },
});
