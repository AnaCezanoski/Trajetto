import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import CustomInput from '@/components/CustomInput';
import PasswordStrength from '@/src/components/PasswordStrength/PasswordStrength';
import { useColors } from '@/src/theme';
import { useResetPassword } from './hooks/useResetPassword';
import { styles } from './styles/styles';

export default function ResetPassword() {
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const {
    email,
    code,
    password,
    loading,
    errors,
    onChangeEmail,
    onChangeCode,
    onChangePassword,
    handleReset,
  } = useResetPassword();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={s.card}>
          <Text style={s.cardTitle}>Redefinir senha</Text>
          <Text style={s.cardSub}>Digite o código enviado para o seu e-mail e escolha uma nova senha.</Text>

          <CustomInput
            label="E-mail"
            type="email"
            value={email}
            onChangeText={onChangeEmail}
            placeholder="seu@email.com"
            autoCapitalize="none"
            error={errors.email}
          />

          <CustomInput
            label="Código de Verificação"
            type="numeric"
            value={code}
            onChangeText={onChangeCode}
            placeholder="000000"
            maxLength={6}
            error={errors.code}
          />

          <CustomInput
            label="Nova Senha"
            type="password"
            value={password}
            onChangeText={onChangePassword}
            placeholder="••••••••"
            error={errors.password}
          />

          {password.length > 0 && <PasswordStrength password={password} style={s.strength} />}

          <TouchableOpacity
            style={[s.loginBtn, loading && s.loginBtnDisabled]}
            onPress={handleReset}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={s.loginBtnText}>{loading ? 'Redefinindo...' : 'Redefinir senha'}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.registerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.registerLink}>Voltar</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
