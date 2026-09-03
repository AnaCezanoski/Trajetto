import React from 'react';
import { Text, View } from 'react-native';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export default function Checkbox({ selected }: { selected: boolean }) {
  const s = styles(useColors());
  return (
    <View style={[s.checkbox, selected && s.checkboxSelected]}>
      {selected && <Text style={s.checkmark}>✓</Text>}
    </View>
  );
}
