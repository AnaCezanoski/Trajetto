import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { passwordStrength } from '@/utils/validators';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export default function PasswordStrength({ password, style }: { password: string; style?: StyleProp<ViewStyle> }) {
  const s = styles(useColors());
  const strength = passwordStrength(password);

  return (
    <View style={[s.strengthRow, style]}>
      <View style={[s.strengthBar, strength.length ? s.strengthOk : s.strengthWeak]} />
      <View style={[s.strengthBar, strength.uppercase && strength.lowercase ? s.strengthOk : s.strengthWeak]} />
      <View style={[s.strengthBar, strength.number ? s.strengthOk : s.strengthWeak]} />
      <View style={[s.strengthBar, strength.special ? s.strengthOk : s.strengthWeak]} />
    </View>
  );
}
