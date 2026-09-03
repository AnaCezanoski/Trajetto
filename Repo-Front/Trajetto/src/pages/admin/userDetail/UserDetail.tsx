import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CustomInput from '@/components/CustomInput';
import CountryPickerModal from '@/src/components/CountryPickerModal/CountryPickerModal';
import { useColors } from '@/src/theme';
import { useUserDetail } from './hooks/useUserDetail';
import { styles } from './styles/styles';

export default function UserDetail() {
  const colors = useColors();
  const s = styles(colors);
  const {
    firstName,
    lastName,
    email,
    birthDate,
    country,
    telephone,
    isAdmin,
    loading,
    showCountries,
    setFirstName,
    setLastName,
    setEmail,
    setBirthDate,
    setTelephone,
    onSelectCountry,
    openCountries,
    closeCountries,
    handleUpdate,
    handleRoleChange,
  } = useUserDetail();

  return (
    <KeyboardAvoidingView style={s.flex} behavior="padding" keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}>
      <ScrollView style={s.flex} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={s.avatarSection}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarEmoji}>👤</Text>
          </View>
          <Text style={s.avatarName}>{firstName} {lastName}</Text>
          <Text style={s.avatarEmail}>{email}</Text>
        </View>

        <Text style={s.sectionTitle}>Informações pessoais</Text>
        <View style={s.card}>
          <View style={s.row}>
            <CustomInput
              label="Nome"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Nome"
              autoCapitalize="words"
              style={s.field}
            />
            <CustomInput
              label="Sobrenome"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Sobrenome"
              autoCapitalize="words"
              style={s.field}
            />
          </View>

          <View style={s.row}>
            <CustomInput
              label="Data de nascimento"
              type="numeric"
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="AAAA-MM-DD"
              style={s.field}
            />
            <CustomInput
              label="Telefone"
              type="phone-pad"
              value={telephone}
              onChangeText={setTelephone}
              placeholder="Telefone"
              style={s.field}
            />
          </View>

          <CustomInput
            label="E-mail"
            type="email"
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            autoCapitalize="none"
          />

          <View style={s.field}>
            <Text style={s.fieldLabel}>País</Text>
            <TouchableOpacity style={s.dropdownTrigger} onPress={openCountries} activeOpacity={0.7}>
              <Text style={country ? s.dropdownValue : s.dropdownPlaceholder}>
                {country || 'Selecione o país'}
              </Text>
              <Text style={s.dropdownChevron}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.sectionTitle}>Cargo</Text>
        <View style={s.card}>
          <Text style={s.roleInfo}>
            Cargo atual: <Text style={s.roleValue}>{isAdmin ? 'Administrador' : 'Usuário'}</Text>
          </Text>
          <View style={s.roleRow}>
            <TouchableOpacity
              style={[s.roleBtn, !isAdmin && s.roleBtnActive]}
              onPress={() => handleRoleChange(false)}
              activeOpacity={0.7}
            >
              <Text style={[s.roleBtnText, !isAdmin && s.roleBtnTextActive]}>👤 Usuário</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.roleBtn, isAdmin && s.roleBtnActive]}
              onPress={() => handleRoleChange(true)}
              activeOpacity={0.8}
            >
              <Text style={[s.roleBtnText, isAdmin && s.roleBtnTextActive]}>🛡️ Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.saveButton} onPress={handleUpdate} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Text style={s.saveButtonText}>Salvar alterações</Text>
          }
        </TouchableOpacity>

      </ScrollView>

      <CountryPickerModal
        visible={showCountries}
        selected={country}
        onSelect={onSelectCountry}
        onClose={closeCountries}
      />
    </KeyboardAvoidingView>
  );
}
