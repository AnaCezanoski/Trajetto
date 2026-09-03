import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { PlacesFilter } from '@/services';
import { useColors } from '@/src/theme';
import { formatDistance } from '../../mapaFormat';
import { styles } from './styles';

type ActiveFilterChipsProps = {
  activeFilter: PlacesFilter;
  onRemove: (patch: Partial<PlacesFilter>) => void;
};

export default function ActiveFilterChips({ activeFilter, onRemove }: ActiveFilterChipsProps) {
  const s = styles(useColors());

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsRow} keyboardShouldPersistTaps="handled">
      {activeFilter.category && (
        <View style={s.chip}>
          <Text style={s.chipText}>📍 {activeFilter.category}</Text>
          <TouchableOpacity onPress={() => onRemove({ category: undefined })}>
            <Text style={s.chipClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeFilter.fee && (
        <View style={s.chip}>
          <Text style={s.chipText}>{activeFilter.fee === 'no' ? '🆓 Gratuito' : '💰 Pago'}</Text>
          <TouchableOpacity onPress={() => onRemove({ fee: undefined })}>
            <Text style={s.chipClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeFilter.hasHours && (
        <View style={s.chip}>
          <Text style={s.chipText}>🕐 Com horário</Text>
          <TouchableOpacity onPress={() => onRemove({ hasHours: undefined })}>
            <Text style={s.chipClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeFilter.profile && (
        <View style={s.chip}>
          <Text style={s.chipText}>👤 {activeFilter.profile}</Text>
          <TouchableOpacity onPress={() => onRemove({ profile: undefined })}>
            <Text style={s.chipClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      {activeFilter.maxDistance && (
        <View style={s.chip}>
          <Text style={s.chipText}>📏 {formatDistance(activeFilter.maxDistance)}</Text>
          <TouchableOpacity onPress={() => onRemove({ maxDistance: undefined })}>
            <Text style={s.chipClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
