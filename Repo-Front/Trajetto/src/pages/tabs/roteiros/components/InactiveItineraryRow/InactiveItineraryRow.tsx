import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Itinerary } from '@/hooks/itineraryStore';
import { useColors } from '@/src/theme';
import { formatDate } from '@/src/pages/tabs/shared/roteiroFormat';
import Checkbox from '../Checkbox/Checkbox';
import { styles } from './styles';

type InactiveItineraryRowProps = {
  item: Itinerary;
  selectMode: boolean;
  selected: boolean;
  activating: boolean;
  deleting: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onActivate: () => void;
  onDelete: () => void;
};

export default function InactiveItineraryRow({
  item, selectMode, selected, activating, deleting, onPress, onLongPress, onActivate, onDelete,
}: InactiveItineraryRowProps) {
  const colors = useColors();
  const s = styles(colors);

  return (
    <View style={[s.inactiveCard, selectMode && selected && s.cardSelected]}>
      <TouchableOpacity
        style={s.inactiveCardRow}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={selectMode ? 0.9 : 1}
      >
        {selectMode && <Checkbox selected={selected} />}
        <View style={s.inactiveCardInfo}>
          <View style={s.inactiveCardTitleRow}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={s.inactiveCardTitle} numberOfLines={1}> {item.places[0]?.name ?? 'Roteiro'}</Text>
          </View>
          <Text style={s.inactiveCardMeta}>
            {item.places.length} paradas · {formatDate(item.startDate)}
          </Text>
        </View>
        {!selectMode && (
          <>
            <TouchableOpacity
              style={s.activateBtn}
              onPress={onActivate}
              disabled={activating}
              activeOpacity={0.8}
            >
              {activating
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Text style={s.activateBtnText}>Ativar</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={s.inactiveDeleteBtn}
              onPress={onDelete}
              disabled={deleting}
              activeOpacity={0.8}
            >
              {deleting
                ? <ActivityIndicator size="small" color={colors.error} />
                : <Ionicons name="trash-outline" size={18} color={colors.error} />
              }
            </TouchableOpacity>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
