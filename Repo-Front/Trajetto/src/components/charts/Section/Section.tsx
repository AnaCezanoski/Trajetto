import React from 'react';
import { Text, View } from 'react-native';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export default function Section({ title, children }: SectionProps) {
  const s = styles(useColors());
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionCard}>{children}</View>
    </View>
  );
}
