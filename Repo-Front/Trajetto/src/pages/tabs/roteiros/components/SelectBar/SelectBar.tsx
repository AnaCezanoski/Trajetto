import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type SelectBarProps = {
  count: number;
  bulkDeleting: boolean;
  onBulkDelete: () => void;
};

export default function SelectBar({ count, bulkDeleting, onBulkDelete }: SelectBarProps) {
  const colors = useColors();
  const s = styles(colors);

  return (
    <View style={s.selectBar}>
      <Text style={s.selectBarCount}>
        {count} selecionado{count !== 1 ? 's' : ''}
      </Text>
      <TouchableOpacity
        style={[s.bulkDeleteBtn, count === 0 && s.bulkDeleteBtnDisabled]}
        onPress={onBulkDelete}
        disabled={count === 0 || bulkDeleting}
        activeOpacity={0.85}
      >
        {bulkDeleting
          ? <ActivityIndicator size="small" color={colors.white} />
          : <Text style={s.bulkDeleteBtnText}>🗑️  Excluir ({count})</Text>
        }
      </TouchableOpacity>
    </View>
  );
}
