import React from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import Logo from '@/assets/appImgs/logo.svg';
import { useColors } from '@/src/theme';
import { useVerifyEmail } from './hooks/useVerifyEmail';
import { styles } from './styles/styles';

export default function VerifyEmail() {
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const { email, code, loading, handleVerify, handleChangeCode } = useVerifyEmail();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={s.scrollView} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.headerWrapper}>
          <View style={s.headerRow}>
            <View style={s.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={32} color={colors.white} />
              </TouchableOpacity>
              <Text style={s.headerText}>Verificação</Text>
            </View>

            <View style={s.headerCenter} pointerEvents="none">
              <View style={s.logoBadge}>
                <Logo width={20} height={20} color={colors.primary} />
              </View>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <Text style={s.title}>Verifique seu Email</Text>
              <Text style={s.subtitle}>
                Enviamos um código de 6 dígitos para{'\n'}
                <Text style={s.emailHighlight}>{email}</Text>
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

              <CustomButton title="Confirmar" onPress={() => handleVerify()} loading={loading} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
