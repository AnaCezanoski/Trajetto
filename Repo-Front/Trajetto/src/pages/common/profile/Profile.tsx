import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomInput from '@/components/CustomInput';
import CountryPickerModal from '@/src/components/CountryPickerModal/CountryPickerModal';
import { useColors } from '@/src/theme';
import AsyncState from '@/src/components/AsyncState/AsyncState';
import { useProfile } from './hooks/useProfile';
import { styles } from './styles/styles';

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const s = styles(colors);
  const {
    firstName,
    lastName,
    email,
    birthDate,
    country,
    telephone,
    loading,
    fetching,
    showCountries,
    errors,
    logout,
    onChangeFirstName,
    onChangeLastName,
    onChangeBirthDate,
    onChangeTelephone,
    onChangeEmail,
    onSelectCountry,
    openCountries,
    closeCountries,
    handleUpdate,
  } = useProfile();

  if (fetching) {
    return <AsyncState style={s.loadingCenter} loading />;
  }

  return (
    <KeyboardAvoidingView style={s.flex} behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}>

      <View style={[s.headerWrapper, { paddingTop: insets.top }]}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={32} color={colors.white} />
            </TouchableOpacity>
            <Text style={s.headerText}>Configurações</Text>
          </View>
        </View>
      </View>
      <ScrollView style={s.flex} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>

        <View style={s.avatarWrapper}>
          <View style={s.avatarSection}>
            <View style={s.avatarCircle}>
              <Ionicons name="person" size={40} color={colors.white} />
            </View>
            <Text style={s.avatarName}>{firstName} {lastName}</Text>
            <Text style={s.avatarEmail}>{email}</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>Informações pessoais</Text>

          <View style={s.row}>
            <CustomInput
              label="Nome"
              value={firstName}
              onChangeText={onChangeFirstName}
              placeholder="Seu nome"
              autoCapitalize="words"
              error={errors.firstName}
              style={s.field}
            />
            <CustomInput
              label="Sobrenome"
              value={lastName}
              onChangeText={onChangeLastName}
              placeholder="Seu sobrenome"
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

          <TouchableOpacity style={s.saveButton} onPress={handleUpdate} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <ActivityIndicator size="small" color={colors.white} />
              : <Text style={s.saveButtonText}>Salvar alterações</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={s.logoutBtn} onPress={logout} activeOpacity={0.7}>
            <Text style={s.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
