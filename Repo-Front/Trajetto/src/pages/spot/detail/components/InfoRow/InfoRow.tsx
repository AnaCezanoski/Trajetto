import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type InfoRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
};

export default function InfoRow({ icon, label, value, onPress }: InfoRowProps) {
  const s = styles(useColors());
  if (!value) return null;
  return (
    <TouchableOpacity style={s.infoRow} onPress={onPress} disabled={!onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={s.infoIconContainer}>
        {typeof icon === 'string' ? <Text style={s.infoIconText}>{icon}</Text> : icon}
      </View>
      <View style={s.infoContent}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={[s.infoValue, onPress && s.infoLink]}>{value}</Text>
      </View>
      {onPress && <Text style={s.infoArrow}>›</Text>}
    </TouchableOpacity>
  );
}
