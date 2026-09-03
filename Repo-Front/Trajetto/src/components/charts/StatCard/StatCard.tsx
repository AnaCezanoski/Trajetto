import React from 'react';
import { Text, View } from 'react-native';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type StatCardProps = {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
};

export default function StatCard({ icon, label, value, color, sub }: StatCardProps) {
  const s = styles(useColors());
  return (
    <View style={[s.statCard, color ? { borderLeftColor: color, borderLeftWidth: 4 } : null]}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
      {sub ? <Text style={s.statSub}>{sub}</Text> : null}
    </View>
  );
}
