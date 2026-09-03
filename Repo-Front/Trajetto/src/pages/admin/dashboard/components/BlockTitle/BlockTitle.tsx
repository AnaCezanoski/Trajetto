import React from 'react';
import { Text } from 'react-native';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export default function BlockTitle({ children }: { children: React.ReactNode }) {
  const s = styles(useColors());
  return <Text style={s.blockTitle}>{children}</Text>;
}
