import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Place } from '@/services';
import { categoryIcon } from '@/src/helpers/categoryIcon';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type SuggestionsListProps = {
  suggestions: Place[];
  onSelect: (spot: Place) => void;
};

export default function SuggestionsList({ suggestions, onSelect }: SuggestionsListProps) {
  const s = styles(useColors());
  return (
    <View style={s.suggestions}>
      <FlatList
        data={suggestions}
        keyExtractor={(item, i) => `${item.name}-${i}`}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.suggestionItem} onPress={() => onSelect(item)} activeOpacity={0.7}>
            <Text style={s.suggestionEmoji}>{categoryIcon(item.category)}</Text>
            <View style={s.suggestionText}>
              <Text style={s.suggestionName} numberOfLines={1}>{item.name}</Text>
              <Text style={s.suggestionCategory}>{item.category}{item.fee === 'no' ? ' · 🆓' : item.fee === 'yes' ? ' · 💰' : ''}</Text>
            </View>
            <Text style={s.suggestionArrow}>↗</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
