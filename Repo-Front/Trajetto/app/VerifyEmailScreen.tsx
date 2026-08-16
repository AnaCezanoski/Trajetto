import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api } from '../services/api';
import { getErrorMessage } from '../utils/apiError';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../assets/appImgs/logo.svg';

const PRIMARY = '#006ecf';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (manualCode?: string) => {
    const codeToVerify = manualCode ?? code;
    Keyboard.dismiss();
    if (codeToVerify.length < 6) {
      Alert.alert('Atenção', 'Digite os 6 dígitos do código.');
      return;
    }
    setLoading(true);
    try {
      await api.post(`/user/verify?email=${email}&code=${codeToVerify}`);
      Alert.alert('Sucesso', 'Conta verificada! Você já pode fazer login.');
      router.replace('/LoginScreen');
    } catch (e) {
      Alert.alert('Erro', getErrorMessage(e, 'Código inválido. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeCode = (text: string) => {
    setCode(text);
    if (text.length === 6) {
      Keyboard.dismiss();
      // pequeno delay para o teclado fechar antes de chamar a API
      setTimeout(() => handleVerify(text), 150);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerWrapper}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={32} color={'white'} />
              </TouchableOpacity>
              <Text style={[styles.headerText, {fontSize: 16}]}>Verificação</Text>
            </View>

            <View style={styles.headerCenter} pointerEvents="none">
              <View style={styles.logoBadge}>
                <Logo width={20} height={20} color={PRIMARY} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <Text style={styles.title}>Verifique seu Email</Text>
              <Text style={styles.subtitle}>
                Enviamos um código de 6 dígitos para{'\n'}
                <Text style={styles.emailHighlight}>
                  {email}
                </Text>
              </Text>

              <CustomInput
                type="code"
                value={code}
                onChangeText={handleChangeCode}
                placeholder="000000"
                maxLength={6}
                returnKeyType="done"
                onSubmitEditing={() => handleVerify()}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.button, loading && { opacity: 0.7 }]}
                onPress={() => handleVerify()}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>Confirmar</Text>
                }
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1 },
  headerWrapper: { paddingHorizontal: 24, paddingBottom: 40, backgroundColor: PRIMARY },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 70, marginBottom: 20, position: 'relative', height: 44 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  headerBackBtn: { padding: 8, marginLeft: -12 },
  headerText: { fontSize: 18, fontWeight: '700', color: 'white', marginLeft: -4 },
  headerCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  logoBadge: { alignItems: 'center', backgroundColor: 'white', borderRadius: 10, padding: 5 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    padding: 32,
  },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, color: PRIMARY, textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 36, textAlign: 'center', lineHeight: 22 },
  emailHighlight: { color: '#3f3f40', fontWeight: '500' },
  button: { backgroundColor: PRIMARY, padding: 16, borderRadius: 12, alignItems: 'center', minHeight: 52, justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});