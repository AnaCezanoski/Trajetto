import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import Logo from '@/assets/appImgs/logo.svg';
import { useColors } from '@/src/theme';
import { useLogin } from './hooks/useLogin';
import { styles } from './styles/styles';

export default function Login() {
  const colors = useColors();
  const s = styles(colors);
  const {
    email,
    password,
    loading,
    error,
    errors,
    setEmail,
    setPassword,
    handleLogin,
    goToForgotPassword,
    goToRegister,
  } = useLogin();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={s.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <View>
            <Animated.Text entering={FadeIn.delay(1000).duration(800)} style={s.intro}>
              Planeje seu
            </Animated.Text>
            <View style={s.titleRow}>
              <Animated.View entering={FadeIn.duration(800)} style={s.logoContainer}>
                <Logo width={40} height={40} color={colors.primary} />
              </Animated.View>
              <Animated.Text entering={SlideInRight.duration(800)} style={s.brand}>
                Trajetto
              </Animated.Text>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Login</Text>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorBoxText}>{error}</Text>
            </View>
          ) : null}

          <CustomInput
            label="E-mail"
            type="email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            autoCapitalize="none"
            error={errors.email}
          />

          <CustomInput
            label="Senha"
            type="password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            error={errors.password}
          />

          <TouchableOpacity onPress={goToForgotPassword}>
            <Text style={s.link}>Esqueceu sua senha?</Text>
          </TouchableOpacity>

          <CustomButton title="Entrar" onPress={handleLogin} loading={loading} />

          <View style={s.registerRow}>
            <Text style={s.registerText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={goToRegister}>
              <Text style={s.registerLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
