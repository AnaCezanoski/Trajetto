import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import Logo from '@/assets/appImgs/logo.svg';
import { useColors } from '@/src/theme';
import { useRegister } from './hooks/useRegister';
import { styles } from './styles/styles';
import PasswordStrength from '@/src/components/PasswordStrength/PasswordStrength';
import CountryPickerModal from '@/src/components/CountryPickerModal/CountryPickerModal';

export default function Register() {
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    birthDate,
    country,
    telephone,
    loading,
    errors,
    showCountries,
    onChangeFirstName,
    onChangeLastName,
    onChangeBirthDate,
    onChangeTelephone,
    onChangeEmail,
    onChangePassword,
    onChangeConfirmPassword,
    onSelectCountry,
    openCountries,
    closeCountries,
    handleRegister,
    goToLogin,
  } = useRegister();

  return (
    <KeyboardAvoidingView style={s.flex} behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}>
      <ScrollView style={s.scrollView} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>

        <View style={s.headerWrapper}>
          <View style={s.headerRow}>
            <View style={s.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={32} color={colors.white} />
              </TouchableOpacity>
              <Text style={s.headerText}>Cadastro</Text>
            </View>

            <View style={s.headerCenter} pointerEvents="none">
              <View style={s.logoBadge}>
                <Logo width={20} height={20} color={colors.primary} />
              </View>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Crie sua conta</Text>

          <View style={s.row}>
            <CustomInput
              label="Nome"
              value={firstName}
              onChangeText={onChangeFirstName}
              placeholder="Ex: João"
              autoCapitalize="words"
              error={errors.firstName}
              style={s.field}
            />
            <CustomInput
              label="Sobrenome"
              value={lastName}
              onChangeText={onChangeLastName}
              placeholder="Ex: Silva"
              autoCapitalize="words"
              error={errors.lastName}
              style={s.field}
            />
          </View>

          <View style={s.row}>
            <CustomInput
              label="Data de nascimento"
              type="numeric"
              value={birthDate}
              onChangeText={onChangeBirthDate}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              error={errors.birthDate}
              style={s.field}
            />
            <CustomInput
              label="Telefone"
              type="phone-pad"
              value={telephone}
              onChangeText={onChangeTelephone}
              placeholder="(00) 00000-0000"
              maxLength={15}
              error={errors.telephone}
              style={s.field}
            />
          </View>

          <CustomInput
            label="E-mail"
            type="email"
            value={email}
            onChangeText={onChangeEmail}
            placeholder="seuemail@exemplo.com"
            autoCapitalize="none"
            error={errors.email}
          />

          <View style={s.field}>
            <Text style={s.label}>País</Text>
            <TouchableOpacity
              style={[s.dropdownTrigger, errors.country ? s.inputError : null]}
              onPress={openCountries}
              activeOpacity={0.7}
            >
              <Text style={country ? s.dropdownValue : s.dropdownPlaceholder}>
                {country || 'Selecione seu país'}
              </Text>
              <Text style={s.dropdownChevron}>▼</Text>
            </TouchableOpacity>
            {errors.country ? <Text style={s.errorText}>{errors.country}</Text> : null}
          </View>

          <CountryPickerModal
            visible={showCountries}
            selected={country}
            onSelect={onSelectCountry}
            onClose={closeCountries}
          />

          <CustomInput
            label="Senha"
            type="password"
            value={password}
            onChangeText={onChangePassword}
            placeholder="Mínimo 8 caracteres"
            error={errors.password}
          />
          {password.length > 0 && <PasswordStrength password={password} />}

          <CustomInput
            label="Repetir Senha"
            type="password"
            value={confirmPassword}
            onChangeText={onChangeConfirmPassword}
            placeholder="Confirme sua senha"
            returnKeyType="done"
            error={errors.confirmPassword}
            inputStyle={confirmPassword.length > 0 && password === confirmPassword ? s.inputOk : null}
          />

          <CustomButton title="Criar Conta" onPress={handleRegister} loading={loading} style={s.button} />

          <TouchableOpacity onPress={goToLogin} style={s.loginLink}>
            <Text style={s.loginLinkText}>Já tem conta? <Text style={s.loginLinkBold}>Entrar</Text></Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
