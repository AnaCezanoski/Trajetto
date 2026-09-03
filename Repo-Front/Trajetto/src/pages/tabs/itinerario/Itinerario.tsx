import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomButton from '@/components/CustomButton';
import { PLACE_COLORS } from '@/constants/placeColors';
import { isPlacePast } from '@/app/utils/isPlacePast';
import { useColors } from '@/src/theme';
import AsyncState from '@/src/components/AsyncState/AsyncState';
import NoItineraryEmptyState from '@/src/pages/tabs/shared/components/NoItineraryEmptyState/NoItineraryEmptyState';
import { useItinerario } from './hooks/useItinerario';
import { styles } from './styles/styles';
import ItineraryHeaderCard from './components/ItineraryHeaderCard/ItineraryHeaderCard';
import TimelineRow from './components/TimelineRow/TimelineRow';
import AlternativesModal from './components/AlternativesModal/AlternativesModal';
import RatingBottomSheet from './components/RatingBottomSheet/RatingBottomSheet';

export default function Itinerario() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const s = styles(colors);
  const {
    destIndex,
    itinerary,
    loading,
    setFocusedMapPlace,
    scrollRef,
    highlightedPlaceIndex,
    registerCardOffset,
    showAltModal,
    swipedPlace,
    alternatives,
    loadingAlts,
    handleSwipeLeft,
    handleSelectAlternative,
    handleCancelAlt,
    rating,
    handleExportPDF,
    router,
  } = useItinerario();

  if (loading) {
    return <AsyncState style={s.center} loading loadingText="Carregando itinerário..." />;
  }

  if (!itinerary) {
    return <NoItineraryEmptyState destIndex={destIndex} />;
  }

  const sorted = [...itinerary.places].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <View style={s.safe}>
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />
      <ScrollView
        ref={scrollRef}
        style={s.container}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <ItineraryHeaderCard
          startDate={itinerary.startDate}
          endDate={itinerary.endDate}
          stopsCount={sorted.length}
        />

        <Text style={s.sectionLabel}>PARADAS DO ROTEIRO</Text>
        <Text style={s.swipeHint}>← Deslize um card para trocar o lugar</Text>

        <View style={s.timeline}>
          {sorted.map((place, idx) => {
            const isPast = isPlacePast(itinerary.startDate, place.estimatedVisitTime);
            const color = PLACE_COLORS[idx % PLACE_COLORS.length];
            const isLast = idx === sorted.length - 1;
            const isHighlighted = highlightedPlaceIndex === idx;

            return (
              <TimelineRow
                key={`${place.name}-${place.orderIndex}`}
                place={place}
                idx={idx}
                color={color}
                isPast={isPast}
                isLast={isLast}
                isHighlighted={isHighlighted}
                onLayout={(e) => registerCardOffset(idx, e.nativeEvent.layout.y, sorted.length)}
                onSwipeLeft={() => handleSwipeLeft(place)}
                onPress={() => {
                  setFocusedMapPlace(idx);
                  router.push({ pathname: '/mapa', params: { from: 'itinerario' } });
                }}
                onInfoPress={() => rating.openBottomSheet(place)}
              />
            );
          })}
        </View>

        <CustomButton
          title="Exportar em PDF"
          onPress={handleExportPDF}
          icon={<Ionicons name="download-outline" size={22} color={colors.white} />}
          style={s.btnExport}
        />
      </ScrollView>

      <AlternativesModal
        visible={showAltModal}
        swipedPlace={swipedPlace}
        alternatives={alternatives}
        loading={loadingAlts}
        onSelect={handleSelectAlternative}
        onCancel={handleCancelAlt}
      />

      <RatingBottomSheet {...rating} />
    </View>
  );
}
