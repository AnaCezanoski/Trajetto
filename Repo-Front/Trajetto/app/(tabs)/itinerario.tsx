import { PLACE_COLORS } from '@/constants/placeColors';
import { useAuth } from '@/context/AuthContext';
import { Places, useItineraryStore } from '@/hooks/itineraryStore';
import { Place, placesService } from '@/services/placesService';
import { RatingService, RatingSummary } from '@/services/ratingService';
import StarRating from '@/components/Rating';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isPlacePast } from '../utils/isPlacePast';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const PRIMARY = '#023665';

function categoryIcon(category: string): string {
  const c = (category || '').toLowerCase();
  if (c.includes('museum'))   return '🏛️';
  if (c.includes('monument')) return '🗿';
  if (c.includes('castle'))   return '🏰';
  if (c.includes('church'))   return '⛪';
  if (c.includes('park'))     return '🌳';
  if (c.includes('square'))   return '🏙️';
  if (c.includes('fountain')) return '⛲';
  if (c.includes('ruins'))    return '🏚️';
  if (c.includes('art'))      return '🎨';
  if (c.includes('view'))     return '🌄';
  if (c.includes('restaurant') || c.includes('food')) return '🍽️';
  if (c.includes('cafe') || c.includes('coffee')) return '☕';
  return '📍';
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const formatTime = (time: string) => time?.slice(0, 5) ?? '';

// ─── Swipeable card wrapper ───────────────────────────────────────────────────

function SwipeableCard({
  children,
  onSwipeLeft,
  disabled = false,
}: {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  disabled?: boolean;
}) {
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-15, 15])
    .failOffsetY([-12, 12])
    .onUpdate(e => {
      if (e.translationX < 0) translateX.value = e.translationX;
    })
    .onEnd(e => {
      if (e.translationX < -80) {
        translateX.value = withTiming(-130, { duration: 120 }, () => {
          translateX.value = withSpring(0);
          runOnJS(onSwipeLeft)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={swipeStyles.wrapper}>
      {!disabled && (
        <View style={swipeStyles.hint}>
          <Text style={swipeStyles.hintIcon}>🔄</Text>
          <Text style={swipeStyles.hintLabel}>Trocar</Text>
        </View>
      )}
      <GestureDetector gesture={pan}>
        <Animated.View style={[swipeStyles.cardWrapper, cardStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const swipeStyles = StyleSheet.create({
  wrapper: { flex: 1, position: 'relative' },
  hint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e8f0fa',
    borderRadius: 16,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 22,
    gap: 4,
  },
  hintIcon: { fontSize: 22 },
  hintLabel: { fontSize: 12, fontWeight: '700', color: '#023665' },
  cardWrapper: { flex: 1 },
});

// ─── Alternatives modal ───────────────────────────────────────────────────────

function AltCard({ alt, onPress }: { alt: Place; onPress: () => void }) {
  return (
    <TouchableOpacity style={altStyles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={altStyles.iconBox}>
        <Text style={altStyles.iconText}>{categoryIcon(alt.category)}</Text>
      </View>
      <View style={altStyles.info}>
        <Text style={altStyles.name} numberOfLines={1}>{alt.name}</Text>
        <Text style={altStyles.cat} numberOfLines={1}>{alt.category}</Text>
        {alt.address ? (
          <Text style={altStyles.addr} numberOfLines={1}>{alt.address}</Text>
        ) : null}
      </View>
      {alt.fee === 'no' && (
        <View style={altStyles.freeBadge}><Text style={altStyles.freeBadgeText}>🆓</Text></View>
      )}
      {alt.fee === 'yes' && (
        <View style={altStyles.paidBadge}><Text style={altStyles.paidBadgeText}>💰</Text></View>
      )}
    </TouchableOpacity>
  );
}

const altStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8,
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#e2e8f0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
  loading: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  list: { gap: 10, marginBottom: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f8fafc', borderRadius: 14,
    padding: 14, borderWidth: 1.5, borderColor: '#e2e8f0', gap: 12,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111827' },
  cat: { fontSize: 12, color: PRIMARY, marginTop: 2, textTransform: 'capitalize', fontWeight: '500' },
  addr: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  freeBadge: { backgroundColor: '#F0FDF4', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  freeBadgeText: { fontSize: 12 },
  paidBadge: { backgroundColor: '#FFF7ED', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  paidBadgeText: { fontSize: 12 },
  cancelBtn: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ItinerarioTab() {
  const { user } = useAuth();
  const {
    itinerary, loading,
    highlightedPlaceIndex, setHighlightedPlace,
    setFocusedMapPlace, replacePlace,
  } = useItineraryStore();

  const [layoutReady, setLayoutReady] = React.useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const cardOffsets = useRef<number[]>([]);

  // ─── Alternatives state ───────────────────────────────────────────────────
  const [showAltModal, setShowAltModal] = useState(false);
  const [swipedPlace, setSwipedPlace] = useState<Places | null>(null);
  const [alternatives, setAlternatives] = useState<Place[]>([]);
  const [loadingAlts, setLoadingAlts] = useState(false);

  // ─── Rating / BottomSheet state ───────────────────────────────────────────
  const bottomSheetRef = useRef<BottomSheet>(null);
  const commentInputRef = useRef<TextInput>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [allRatings, setAllRatings] = useState<any[]>([]);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [ratingData, setRatingData] = useState<RatingSummary | undefined>();
  const [myRating, setMyRating] = useState<any>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');
  const snapPoints = React.useMemo(() => ['45%', '90%'], []);

  const openBottomSheet = (place: any) => {
    setSelectedPlace(place);
    setIsRatingOpen(false);
    setRatingValue(0);
    setComment('');
    setMyRating(null);
    setAllRatings([]);
    bottomSheetRef.current?.expand();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  useEffect(() => {
    if (!selectedPlace?.xid) return;
    RatingService.getSummary(selectedPlace.xid).then(setRatingData).catch(console.log);
    RatingService.getByPlace(selectedPlace.xid).then((ratings) => {
      setAllRatings(ratings);
      const mine = ratings.find((r: any) => r.userId === user?.id);
      setMyRating(mine ?? null);
    });
  }, [selectedPlace]);

  // Scroll to highlighted card when coming from map
  useEffect(() => {
    if (highlightedPlaceIndex === null) return;
    const offset = cardOffsets.current[highlightedPlaceIndex];
    if (offset !== undefined) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, offset - 20), animated: true });
      }, 100);
    }
    const timer = setTimeout(() => setHighlightedPlace(null), 800);
    return () => clearTimeout(timer);
  }, [highlightedPlaceIndex]);

  useFocusEffect(
    useCallback(() => {
      if (!layoutReady) return;
      if (!itinerary?.places?.length) return;

      const sorted = [...itinerary.places].sort((a, b) => a.orderIndex - b.orderIndex);
      const firstUpcomingIndex = sorted.findIndex(
        place => !isPlacePast(itinerary.startDate, place.estimatedVisitTime)
      );
      if (firstUpcomingIndex === -1) return;

      requestAnimationFrame(() => {
        const offset = cardOffsets.current[firstUpcomingIndex];
        if (offset == null) return;
        scrollRef.current?.scrollTo({ y: Math.max(0, offset - 100), animated: true });
      });
    }, [layoutReady, itinerary])
  );

  // ─── Swipe handler ────────────────────────────────────────────────────────
  const handleSwipeLeft = useCallback(async (place: Places) => {
    setSwipedPlace(place);
    setShowAltModal(true);
    setLoadingAlts(true);
    setAlternatives([]);

    const tp = user?.travelerProfile;
    const profile = tp && tp !== 'SKIPPED' ? tp : undefined;

    const currentNames = new Set(itinerary?.places.map(p => p.name) ?? []);
    const exclude = (list: Place[]) =>
      list.filter(p => p.name !== place.name && !currentNames.has(p.name));
    const pick = (list: Place[], n: number) =>
      [...list].sort(() => Math.random() - 0.5).slice(0, n);

    try {
      const allByProfile = await placesService.getAll({ profile });
      const available = exclude(allByProfile);

      const sameCategory = available.filter(p => p.category === place.category);
      const same2 = pick(sameCategory, 2);

      const same2Names = new Set(same2.map(p => p.name));
      const different = available.filter(
        p => p.category !== place.category && !same2Names.has(p.name)
      );
      const diff1 = pick(different, 1);

      const result = [...same2, ...diff1];

      if (result.length === 0) {
        setAlternatives(pick(available, 3));
      } else {
        setAlternatives(result);
      }
    } catch {
      setAlternatives([]);
    } finally {
      setLoadingAlts(false);
    }
  }, [itinerary, user]);

  const handleSelectAlternative = useCallback(async (alt: Place) => {
    if (!swipedPlace) return;
    const newPlace: Places = {
      name: alt.name,
      address: alt.address,
      latitude: alt.latitude,
      longitude: alt.longitude,
      estimatedVisitTime: swipedPlace.estimatedVisitTime,
      orderIndex: swipedPlace.orderIndex,
      openingHours: alt.openingHours ?? null,
      category: alt.category ?? null,
      fee: alt.fee ?? null,
    };
    setShowAltModal(false);
    setSwipedPlace(null);
    setAlternatives([]);
    try {
      await replacePlace(swipedPlace.orderIndex, newPlace);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a alteração.');
    }
  }, [swipedPlace, replacePlace]);

  const handleCancelAlt = useCallback(() => {
    setShowAltModal(false);
    setSwipedPlace(null);
    setAlternatives([]);
  }, []);

  // ─── PDF Export ───────────────────────────────────────────────────────────
  const handleExportPDF = async () => {
    if (!itinerary) return;

    const sortedPlaces = [...itinerary.places].sort((a, b) => a.orderIndex - b.orderIndex);

    let placesHtml = '';
    sortedPlaces.forEach((place, index) => {
      placesHtml += `
        <div style="margin-bottom: 20px; padding: 15px; border-left: 5px solid ${PRIMARY}; background-color: #f8fafc; border-radius: 4px;">
          <h3 style="margin: 0 0 8px 0; color: #1a1a1a; font-size: 18px;">${index + 1}. ${place.name}</h3>
          <p style="margin: 4px 0; font-size: 14px; color: #4a5568;"><strong>🕒 Horário Estimado:</strong> ${formatTime(place.estimatedVisitTime)}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #4a5568;"><strong>📍 Endereço:</strong> ${place.address}</p>
          ${place.category ? `<p style="margin: 4px 0; font-size: 14px; color: #4a5568;"><strong>🏷️ Categoria:</strong> ${place.category}</p>` : ''}
          ${place.openingHours ? `<p style="margin: 4px 0; font-size: 14px; color: #4a5568;"><strong>🕐 Horário de Func.:</strong> ${place.openingHours}</p>` : ''}
        </div>
      `;
    });

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid ${PRIMARY}; padding-bottom: 20px; }
            .header h1 { color: ${PRIMARY}; margin: 0 0 10px 0; font-size: 28px; }
            .header p { margin: 5px 0; font-size: 16px; color: #64748b; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Trajetto - Roteiro de Viagem</h1>
            <p><strong>Período:</strong> ${formatDate(itinerary.startDate)} a ${formatDate(itinerary.endDate)}</p>
            <p><strong>Total de paradas:</strong> ${sortedPlaces.length}</p>
          </div>
          <h2 style="color: ${PRIMARY}; margin-bottom: 20px;">Suas Paradas</h2>
          ${placesHtml}
          <div class="footer">
            <p>Documento gerado pelo aplicativo Trajetto.</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS === 'android') {
        const StorageAccessFramework = (FileSystem as any).StorageAccessFramework;
        if (StorageAccessFramework) {
          const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (permissions.granted) {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
            const newUri = await StorageAccessFramework.createFileAsync(permissions.directoryUri, 'Trajetto_Roteiro.pdf', 'application/pdf');
            await FileSystem.writeAsStringAsync(newUri, base64, { encoding: 'base64' });
            Alert.alert("Sucesso", "Roteiro salvo no seu celular!");
            return;
          }
        }
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Salvar Roteiro' });
      } else {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Salvar Roteiro' });
      }
    } catch (error) {
      console.log('Erro ao exportar:', error);
      Alert.alert("Erro", "Não foi possível gerar ou salvar o PDF.");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>Carregando itinerário...</Text>
      </View>
    );
  }

  if (!itinerary) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={styles.emptyTitle}>Sem itinerário</Text>
        <Text style={styles.emptyDesc}>Nenhum roteiro encontrado.</Text>
      </View>
    );
  }

  const sorted = [...itinerary.places].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View style={styles.headerCard}>
          <Text style={styles.headerLabel}>Período</Text>
          <Text style={styles.headerDates}>
            {formatDate(itinerary.startDate)} → {formatDate(itinerary.endDate)}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{sorted.length}</Text>
              <Text style={styles.statLabel}>Paradas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {Math.ceil(
                  (new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime())
                  / (1000 * 60 * 60 * 24)
                ) + 1}
              </Text>
              <Text style={styles.statLabel}>Dias</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <View style={styles.activeDot} />
              <Text style={styles.statLabel}>Ativo</Text>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <Text style={styles.sectionLabel}>PARADAS DO ROTEIRO</Text>
        <Text style={styles.swipeHint}>← Deslize um card para trocar o lugar</Text>

        <View style={styles.timeline}>
          {sorted.map((place, idx) => {
            const isPast = isPlacePast(itinerary.startDate, place.estimatedVisitTime);
            const color = PLACE_COLORS[idx % PLACE_COLORS.length];
            const isLast = idx === sorted.length - 1;
            const isHighlighted = highlightedPlaceIndex === idx;

            return (
              <View
                key={`${place.name}-${place.orderIndex}`}
                style={styles.timelineRow}
                onLayout={e => {
                  cardOffsets.current[idx] = e.nativeEvent.layout.y;
                  if (cardOffsets.current.length === sorted.length) setLayoutReady(true);
                }}
              >
                {/* Rail */}
                <View style={styles.rail}>
                  <View style={[
                    styles.dot,
                    isPast
                      ? { backgroundColor: '#9aa4b2', opacity: 0.6 }
                      : { backgroundColor: color },
                  ]} />
                  {!isLast && <View style={styles.line} />}
                </View>

                {/* Swipeable card — apenas futuros */}
                <SwipeableCard onSwipeLeft={() => handleSwipeLeft(place)} disabled={isPast}>
                  <TouchableOpacity
                    style={[
                      styles.card,
                      isLast && { marginBottom: 0 },
                      isHighlighted && { borderWidth: 2, borderColor: color, shadowOpacity: 0.18 },
                      isPast && { backgroundColor: '#d9d9d9', opacity: 0.3 },
                    ]}
                    activeOpacity={0.75}
                    onPress={() => {
                      setFocusedMapPlace(idx);
                      router.push({ pathname: '/mapa', params: { from: 'itinerario' } });
                    }}
                  >
                    <View style={styles.cardTop}>
                      <View style={[styles.orderBadge, { backgroundColor: color }]}>
                        <Text style={styles.orderText}>{idx + 1}</Text>
                      </View>
                      <Text style={[styles.timeText, { color }]}>{formatTime(place.estimatedVisitTime)}</Text>
                    </View>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <View style={styles.tagsRow}>
                      {place.category ? (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>
                            {categoryIcon(place.category)}{' '}
                            {place.category.charAt(0).toUpperCase() + place.category.slice(1)}
                          </Text>
                        </View>
                      ) : null}
                      {place.fee === 'yes' ? (
                        <View style={styles.feeBadge}>
                          <Text style={styles.feeText}>🎟️ Paid entry</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.placeAddress} numberOfLines={2}>{place.address}</Text>
                    {place.openingHours ? (
                      <View style={styles.hoursRow}>
                        <Text style={styles.hoursIcon}>🕐</Text>
                        <Text style={styles.hoursText} numberOfLines={2}>{place.openingHours}</Text>
                      </View>
                    ) : null}
                    <View style={styles.infoSection}>
                      <Text style={[styles.mapHint, { color }]}>Ver no mapa ↗</Text>
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                        onPress={() => openBottomSheet(place)}
                      >
                        <Text style={[styles.mapHint, { color }]}>Sobre</Text>
                        <Text style={{ fontSize: 11, color }}>ℹ️</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </SwipeableCard>
              </View>
            );
          })}
        </View>

        {/* Botão de Exportar PDF */}
        <TouchableOpacity style={styles.btnExport} onPress={handleExportPDF}>
          <Text style={styles.btnExportText}>📄 Exportar em PDF</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ─── Modal de alternativas ─── */}
      <Modal
        visible={showAltModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelAlt}
      >
        <View style={altStyles.overlay}>
          <View style={altStyles.sheet}>
            <View style={altStyles.handle} />
            <Text style={altStyles.title}>Trocar lugar</Text>
            {swipedPlace && (
              <Text style={altStyles.subtitle}>
                Substituir "{swipedPlace.name}" por:
              </Text>
            )}

            {loadingAlts ? (
              <View style={altStyles.loading}>
                <ActivityIndicator size="large" color={PRIMARY} />
                <Text style={altStyles.loadingText}>Buscando alternativas...</Text>
              </View>
            ) : alternatives.length === 0 ? (
              <View style={altStyles.empty}>
                <Text style={altStyles.emptyText}>Nenhuma alternativa encontrada.</Text>
              </View>
            ) : (
              <View style={altStyles.list}>
                {alternatives.map((alt, i) => (
                  <AltCard key={i} alt={alt} onPress={() => handleSelectAlternative(alt)} />
                ))}
              </View>
            )}

            <TouchableOpacity style={altStyles.cancelBtn} onPress={handleCancelAlt}>
              <Text style={altStyles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── BottomSheet de detalhes e rating ─── */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
            {selectedPlace && (
              <>
                <Text style={[styles.bsTextPrimary, { marginBottom: 12 }]}>{selectedPlace.name}</Text>

                {selectedPlace.category && (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                      <Text style={styles.bsTextSecondary}>Categoria:</Text>
                      <Text style={styles.bsTextTertiary}>{selectedPlace.category}</Text>
                    </View>
                    <View style={styles.bsDivider} />
                  </>
                )}

                {selectedPlace.address && (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={styles.bsTextTertiary}>📍 {selectedPlace.address}</Text>
                    </View>
                    <View style={styles.bsDivider} />
                  </>
                )}

                {selectedPlace.openingHours && (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Text style={styles.bsTextTertiary}>🕐 {selectedPlace.openingHours}</Text>
                    </View>
                    <View style={styles.bsDivider} />
                  </>
                )}

                <TouchableOpacity onPress={() => setIsRatingOpen(!isRatingOpen)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={styles.bsTextTertiary}>⭐ {ratingData?.average?.toFixed(1) ?? '0.0'}</Text>
                    <StarRating value={ratingData?.average ?? 0} size={18} onChange={() => {}} readonly />
                    <Text style={styles.bsTextTertiary}>{ratingData?.count ?? 0} visitaram</Text>
                    <Text style={{ marginLeft: 'auto', color: PRIMARY }}>{isRatingOpen ? '▲' : '▼'}</Text>
                  </View>
                  <View style={styles.bsDivider} />
                </TouchableOpacity>

                {isRatingOpen && (
                  <>
                    <View style={styles.ratingDropdown}>
                      <Text style={styles.ratingTitle}>Avaliar lugar</Text>
                      <StarRating value={ratingValue} size={22} onChange={setRatingValue} />
                      <TextInput
                        ref={commentInputRef}
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Escreva um comentário..."
                        placeholderTextColor="#9aa4b2"
                        style={styles.ratingInput}
                        multiline
                      />
                      <TouchableOpacity
                        style={styles.ratingButton}
                        onPress={async () => {
                          if (!selectedPlace?.xid) return;
                          try {
                            if (myRating) {
                              const updated = await RatingService.update(myRating.id, {
                                userId: user?.id ?? 0,
                                rating: ratingValue,
                                comment,
                              });
                              setMyRating(updated);
                            } else {
                              const created = await RatingService.create({
                                placeId: selectedPlace.xid,
                                userId: user?.id ?? 0,
                                userName: `${user?.firstName} ${user?.lastName}`,
                                rating: ratingValue,
                                comment,
                              });
                              setMyRating(created);
                            }
                            setIsRatingOpen(false);
                            const summary = await RatingService.getSummary(selectedPlace.xid);
                            setRatingData(summary);
                            const ratings = await RatingService.getByPlace(selectedPlace.xid);
                            setAllRatings(ratings);
                          } catch (e) {
                            console.error('Erro ao salvar avaliação:', e);
                          }
                        }}
                      >
                        <Text style={styles.ratingButtonText}>Salvar avaliação</Text>
                      </TouchableOpacity>
                    </View>

                    {allRatings.map((r) => {
                      const isMe = r.userId === user?.id;
                      const name = isMe ? `${user?.firstName} ${user?.lastName}` : r.userName ?? `Usuário ${r.userId}`;
                      return (
                        <View key={r.id} style={styles.reviewCard}>
                          <View style={styles.reviewHeader}>
                            <View style={styles.reviewAvatar}>
                              <Text style={styles.reviewAvatarText}>{name.charAt(0).toUpperCase()}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.reviewName}>{name}</Text>
                              <StarRating value={r.rating} size={14} readonly onChange={() => {}} />
                            </View>
                            {isMe && (
                              <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity onPress={() => {
                                  setMyRating(r);
                                  setRatingValue(r.rating);
                                  setComment(r.comment ?? '');
                                  setIsRatingOpen(true);
                                  setTimeout(() => commentInputRef.current?.focus(), 100);
                                }}>
                                  <Text style={{ fontSize: 16 }}>✏️</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                  Alert.alert('Excluir avaliação', 'Tem certeza?', [
                                    { text: 'Cancelar', style: 'cancel' },
                                    {
                                      text: 'Excluir', style: 'destructive',
                                      onPress: async () => {
                                        try {
                                          await RatingService.delete(r.id, user?.id ?? 0);
                                          setMyRating(null);
                                          const summary = await RatingService.getSummary(selectedPlace.xid);
                                          setRatingData(summary);
                                          const ratings = await RatingService.getByPlace(selectedPlace.xid);
                                          setAllRatings(ratings);
                                        } catch (e) { console.error(e); }
                                      },
                                    },
                                  ]);
                                }}>
                                  <Text style={{ fontSize: 16 }}>🗑️</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                          {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
                        </View>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </Pressable>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#023665' },
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  content: { padding: 20, paddingBottom: 32 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { marginTop: 16, fontSize: 15, color: '#888' },
  emptyState: {
    alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32,
    backgroundColor: '#f9f9f9', flex: 1, justifyContent: 'center',
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#888', textAlign: 'center' },

  headerCard: {
    backgroundColor: PRIMARY, borderRadius: 20, padding: 24, marginBottom: 24,
  },
  headerLabel: {
    fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4,
  },
  headerDates: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ade80', marginBottom: 4 },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#8a9ab0',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 6,
  },
  swipeHint: {
    fontSize: 12, color: '#aab4c2', marginBottom: 16, fontStyle: 'italic',
  },

  timeline: {},
  timelineRow: { flexDirection: 'row' },
  rail: { alignItems: 'center', width: 24, marginRight: 14 },
  dot: { width: 14, height: 14, borderRadius: 7, marginTop: 18 },
  line: { flex: 1, width: 2, backgroundColor: '#dde4ee', marginTop: 4 },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  orderBadge: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  orderText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  timeText: { fontSize: 13, fontWeight: '700' },
  placeName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  categoryBadge: {
    backgroundColor: '#eef2f7', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  categoryText: { fontSize: 12, fontWeight: '600', color: '#4a5568' },
  feeBadge: {
    backgroundColor: '#fff7ed', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  feeText: { fontSize: 12, fontWeight: '600', color: '#c2410c' },
  placeAddress: { fontSize: 13, color: '#8a9ab0', lineHeight: 18, marginBottom: 6 },
  hoursRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 6 },
  hoursIcon: { fontSize: 12, marginTop: 1 },
  hoursText: { fontSize: 12, color: '#6b7280', flex: 1, lineHeight: 17 },
  mapHint: { fontSize: 11, fontWeight: '600', opacity: 0.75 },
  infoSection: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  bottomSheetContent: { flex: 1, margin: 16, gap: 5, paddingBottom: 30 },
  bsTextPrimary: { fontSize: 22, fontWeight: 'bold', color: PRIMARY },
  bsTextSecondary: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
  bsTextTertiary: { fontSize: 16, color: '#4a5568' },
  bsDivider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },

  ratingDropdown: {
    marginTop: 10, padding: 12, backgroundColor: '#f8fafc',
    borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', gap: 10,
  },
  ratingTitle: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  ratingInput: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10,
    padding: 10, fontSize: 13, minHeight: 60, textAlignVertical: 'top', backgroundColor: '#fff',
  },
  ratingButton: { backgroundColor: PRIMARY, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  ratingButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  reviewCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#e5e7eb', gap: 8, marginTop: 16,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: PRIMARY, alignItems: 'center', justifyContent: 'center',
  },
  reviewAvatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  reviewName: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  reviewComment: { fontSize: 13, color: '#4a5568', lineHeight: 18 },

  btnExport: {
    marginTop: 24,
    backgroundColor: PRIMARY,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4
  },
  btnExportText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
