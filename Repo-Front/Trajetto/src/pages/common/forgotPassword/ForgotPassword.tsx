import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import Logo from '@/assets/appImgs/logo.svg';
import { useColors } from '@/src/theme';
import { useForgotPassword } from './hooks/useForgotPassword';
import { styles } from './styles/styles';

export default function ForgotPassword() {
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const { email, loading, errors, onChangeEmail, handleSend } = useForgotPassword();

  return (
    <KeyboardAvoidingView style={s.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.headerWrapper}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={32} color={colors.white} />
            </TouchableOpacity>
            <Text style={s.headerText}>Esqueci a Senha</Text>
          </View>

          <View style={s.headerCenter} pointerEvents="none">
            <View style={s.logoBadge}>
              <Logo width={20} height={20} color={colors.primary} />
            </View>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <View>
            <Text style={s.cardTitle}>Esqueceu sua senha?</Text>
          </View>

          <View style={s.formBlock}>
            <Text style={s.cardSub}>Insira seu e-mail e enviaremos um código de verificação.</Text>
            <CustomInput
              label="E-mail"
              type="email"
              value={email}
              onChangeText={onChangeEmail}
              placeholder="seu@email.com"
              autoCapitalize="none"
              error={errors.email}
            />
            <CustomButton title="Enviar código" onPress={handleSend} loading={loading} />
          </View>

          <View style={s.registerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={s.registerLink}>Voltar ao Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
