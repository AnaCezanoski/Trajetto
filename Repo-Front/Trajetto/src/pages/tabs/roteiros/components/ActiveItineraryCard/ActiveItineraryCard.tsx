import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Itinerary } from '@/hooks/itineraryStore';
import { useColors } from '@/src/theme';
import { isPlacePast } from '@/app/utils/isPlacePast';
import { formatDate, formatTime } from '@/src/pages/tabs/shared/roteiroFormat';
import Checkbox from '../Checkbox/Checkbox';
import { styles } from './styles';

type ActiveItineraryCardProps = {
  itinerary: Itinerary;
  selectMode: boolean;
  selected: boolean;
  deleting: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onDelete: () => void;
};

export default function ActiveItineraryCard({
  itinerary, selectMode, selected, deleting, onPress, onLongPress, onDelete,
}: ActiveItineraryCardProps) {
  const colors = useColors();
  const s = styles(colors);

  const days = Math.ceil(
    (new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime()) /
    (1000 * 60 * 60 * 24)
  ) + 1;

  return (
    <TouchableOpacity
      style={[s.itineraryCard, selectMode && selected && s.cardSelected]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.9}
    >
      {selectMode && (
        <View style={s.checkboxRow}>
          <Checkbox selected={selected} />
        </View>
      )}
      <View style={s.itineraryCardHeader}>
        <View style={s.activeBadge}>
          <View style={s.activeDot} />
          <Text style={s.activeBadgeText}>Ativo</Text>
        </View>
        <Text style={s.itineraryDates}>
          {formatDate(itinerary.startDate)} → {formatDate(itinerary.endDate)}
        </Text>
      </View>

      <View style={s.titleRow}>
        <Ionicons name="location" size={18} color={colors.primary} style={s.locationIcon} />
        <Text style={s.itineraryCardTitle} numberOfLines={1}>
          {itinerary.places[0]?.name ?? 'Roteiro'}
        </Text>
        {!selectMode && <Text style={s.chevron}>›</Text>}
      </View>

      <Text style={s.itineraryCardSub}>
        {itinerary.places.length} paradas · {days} dias
      </Text>

      {!selectMode && (
        <View style={s.timeline}>
          {itinerary.places
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((place, idx) => {
              const isPast = isPlacePast(itinerary.startDate, place.estimatedVisitTime);
              return (
                <View key={idx} style={s.timelineItem}>
                  <View style={s.timelineLeft}>
                    <View style={[s.timelineDot, isPast ? s.timelineDotPast : (idx === 0 ? s.timelineDotFirst : s.timelineDotNext)]} />
                    {idx < itinerary.places.length - 1 && <View style={s.timelineLine} />}
                  </View>
                  <View style={[s.timelineContent, isPast && s.timelineContentPast]}>
                    <Text style={s.timelineTime}>{formatTime(place.estimatedVisitTime)}</Text>
                    <Text style={s.timelineName} numberOfLines={1}>{place.name}</Text>
                    <Text style={s.timelineAddress} numberOfLines={1}>{place.address}</Text>
                  </View>
                </View>
              );
            })}
        </View>
      )}

      {!selectMode && <View style={s.divider} />}
      {!selectMode && (
        <TouchableOpacity
          style={s.deleteBtn}
          onPress={onDelete}
          disabled={deleting}
          activeOpacity={0.8}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={colors.error} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={s.deleteBtnText}>Excluir roteiro</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
