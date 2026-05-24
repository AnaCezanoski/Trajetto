import { PLACE_COLORS } from '@/constants/placeColors';
import { useItineraryStore } from '@/hooks/itineraryStore';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { isPlacePast } from '../utils/isPlacePast';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import StarRating from '@/components/Rating';
import { RatingService, RatingSummary } from '@/services/ratingService';
import { useAuth } from '@/context/AuthContext';

const PRIMARY = '#023665';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const formatTime = (time: string) => time?.slice(0, 5) ?? '';

export default function ItinerarioTab() {
  const { user } = useAuth();
  const commentInputRef = useRef<TextInput>(null);
  const [allRatings, setAllRatings] = React.useState<any[]>([]);
  const [isRatingOpen, setIsRatingOpen] = React.useState(false);
  const [ratingData, setRatingData] = React.useState<RatingSummary>();
  const [myRating, setMyRating] = React.useState<any>(null);
  const [ratingValue, setRatingValue] = React.useState(0);
  const [comment, setComment] = React.useState('');

  const { itinerary, loading, highlightedPlaceIndex, setHighlightedPlace, setFocusedMapPlace } = useItineraryStore();
  const [layoutReady, setLayoutReady] = React.useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();
  const cardOffsets = useRef<number[]>([]);

  useEffect(() => {
    if (highlightedPlaceIndex === null) return;
    const offset = cardOffsets.current[highlightedPlaceIndex];
    if (offset !== undefined) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: Math.max(0, offset - 20), animated: true });
      }, 100);
    }
    // Clear after scrolling so it doesn't re-trigger
    const timer = setTimeout(() => setHighlightedPlace(null), 800);
    return () => clearTimeout(timer);
  }, [highlightedPlaceIndex]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedPlace, setSelectedPlace] = React.useState<any>(null);

  const snapPoints = React.useMemo(() => ['45%', '90%'], []);

  const openBottomSheet = (place: any) => {
    setSelectedPlace(place);
    setIsRatingOpen(false);
    setRatingValue(0);
    setComment('');
    setMyRating(null);
    bottomSheetRef.current?.expand();
    setAllRatings([]);
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );


  useEffect(() => {
    if (!selectedPlace?.xid) return;

    RatingService.getSummary(selectedPlace.xid)
      .then(setRatingData)
      .catch(console.log);

    RatingService.getByPlace(selectedPlace.xid)
      .then((ratings) => {
        setAllRatings(ratings);
        const mine = ratings.find(r => r.userId === user?.id);
        setMyRating(mine ?? null);
      });
  }, [selectedPlace]);




  useFocusEffect(
    useCallback(() => {
      if (!layoutReady) return;
      if (!itinerary?.places?.length) return;

      const sorted = [...itinerary.places].sort(
        (a, b) => a.orderIndex - b.orderIndex
      );

      const firstUpcomingIndex = sorted.findIndex(place => {
        return !isPlacePast(itinerary.startDate, place.estimatedVisitTime);
      });

      if (firstUpcomingIndex === -1) return;

      requestAnimationFrame(() => {
        const offset = cardOffsets.current[firstUpcomingIndex];
        if (offset == null) return;

        scrollRef.current?.scrollTo({
          y: Math.max(0, offset - 100),
          animated: true,
        });
      });
    }, [layoutReady, itinerary])
  );



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

  return (<SafeAreaView style={styles.safe}>
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
      <View style={styles.timeline}>
        {sorted.map((place, idx) => {
          const isPast = isPlacePast(itinerary.startDate, place.estimatedVisitTime);
          const color = PLACE_COLORS[idx % PLACE_COLORS.length];
          const isLast = idx === sorted.length - 1;
          const isHighlighted = highlightedPlaceIndex === idx;

          return (
            <View
              key={idx}
              style={styles.timelineRow}
              onLayout={e => {
                cardOffsets.current[idx] = e.nativeEvent.layout.y;

                // verifica se todos os cards já foram medidos
                if (cardOffsets.current.length === sorted.length) {
                  setLayoutReady(true);
                }
              }}
            >
              {/* Rail */}
              <View style={styles.rail}>
                <View style={[styles.dot, isPast ? { backgroundColor: '#9aa4b2', opacity: 0.6 } : { backgroundColor: color }]} />
                {!isLast && <View style={styles.line} />}
              </View>

              {/* Card */}
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
                  router.push({
                    pathname: '/mapa',
                    params: { from: 'itinerario' }
                  });
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
                        {place.category === 'museum' ? '🏛️ Museum'
                          : place.category === 'attraction' ? '🎯 Attraction'
                            : place.category === 'park' ? '🌳 Park'
                              : place.category === 'church' ? '⛪ Church'
                                : `📍 ${place.category.charAt(0).toUpperCase() + place.category.slice(1)}`}
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
                  <Text style={[styles.mapHint, { color }]}>View on map ↗</Text>
                  <TouchableOpacity style={{ padding: 5, flexDirection: 'row', alignItems: "center", gap: 5 }} onPress={() => openBottomSheet(place)}>
                    <Text style={[styles.mapHint, { color }]}>Sobre</Text>
                    <IconSymbol size={12} name="info.circle" color={color} />
                  </TouchableOpacity>

                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </ScrollView>

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
        <Pressable
          style={{ flex: 1 }}
          onPress={Keyboard.dismiss}
        >
          {selectedPlace && (
            <>
              <Text style={[styles.bottomSheetTextPrimary, { marginBottom: 12 }]}>
                {selectedPlace.name}
              </Text>

              {selectedPlace.category && (
                <>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 12 }}>
                    <Text style={styles.bottomSheetTextSecondary}>
                      Categoria:
                    </Text>
                    <Text style={styles.bottomSheetTextTertiary}>
                      {selectedPlace.category}
                    </Text>
                  </View>

                  <View style={styles.divider} />
                </>
              )}

              {selectedPlace.address && (
                <>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <View style={{ backgroundColor: "#dde5ec", padding: 8, borderRadius: 8 }}>
                      <IconSymbol size={18} name="mappin.and.ellipse" color={PRIMARY} weight={'bold'} />
                    </View>
                    <Text style={styles.bottomSheetTextTertiary}>
                      {selectedPlace.address}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                </>
              )}

              {selectedPlace.openingHours && (
                <>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <View style={{ backgroundColor: "#dde5ec", padding: 8, borderRadius: 8 }}>
                      <IconSymbol size={18} name="clock" color={PRIMARY} weight={'bold'} />
                    </View>
                    <Text style={styles.bottomSheetTextTertiary}>
                      {selectedPlace.openingHours}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                </>
              )}


              <TouchableOpacity
                onPress={() => setIsRatingOpen(!isRatingOpen)}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 30 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <View style={{ backgroundColor: "#dde5ec", padding: 8, borderRadius: 8 }}>
                      <IconSymbol size={18} name="star" color={PRIMARY} weight={'bold'} />
                    </View>
                    <Text style={styles.bottomSheetTextTertiary}>
                      {ratingData?.average?.toFixed(1) ?? '0.0'}
                    </Text>
                    <StarRating
                      value={ratingData?.average ?? 0}
                      size={18}
                      onChange={() => { }}
                      readonly
                    />
                    <Text style={styles.bottomSheetTextTertiary}>
                      {ratingData?.count ?? 0} visitaram
                    </Text>
                  </View>
                  <IconSymbol size={18} name={isRatingOpen ? "chevron.up" : "chevron.down"} color={PRIMARY} weight={'bold'} />
                </View>
                <View style={styles.divider} />
              </TouchableOpacity>
              {isRatingOpen && (
                <>
                  <View style={styles.ratingDropdown}>
                    <Text style={styles.ratingTitle}>Avaliar lugar</Text>

                    <StarRating
                      value={ratingValue}
                      size={22}
                      onChange={(rating) => setRatingValue(rating)}
                    />

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
                        console.log('selectedPlace:', selectedPlace);
                        console.log('ratingValue:', ratingValue);
                        console.log('comment:', comment);

                        if (!selectedPlace?.xid) {
                          console.warn('xid ausente — verifique o campo correto:', Object.keys(selectedPlace ?? {}));
                          return;
                        }
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
                          const ratings = await RatingService.getByPlace(selectedPlace.xid);  // ← adicionar
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
                    const name = isMe
                      ? `${user?.firstName} ${user?.lastName}`
                      : r.userName ?? `Usuário ${r.userId}`;
                    const initial = name.charAt(0).toUpperCase();

                    return (
                      <View key={r.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                          <View style={styles.reviewAvatar}>
                            <Text style={styles.reviewAvatarText}>{initial}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.reviewName}>{name}</Text>
                            <StarRating value={r.rating} size={14} readonly onChange={() => { }} />
                          </View>

                          {isMe && (
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                              <TouchableOpacity
                                onPress={() => {
                                  setMyRating(r);
                                  setRatingValue(r.rating);
                                  setComment(r.comment ?? '');
                                  setIsRatingOpen(true);
                                  setTimeout(() => commentInputRef.current?.focus(), 100);
                                }}
                              >
                                <IconSymbol name="pencil" size={18} color={PRIMARY} />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => {
                                  Alert.alert(
                                    'Excluir avaliação',
                                    'Tem certeza que deseja excluir sua avaliação?',
                                    [
                                      { text: 'Cancelar', style: 'cancel' },
                                      {
                                        text: 'Excluir',
                                        style: 'destructive',
                                        onPress: async () => {
                                          try {
                                            await RatingService.delete(r.id, user?.id ?? 0);
                                            setMyRating(null);
                                            const summary = await RatingService.getSummary(selectedPlace.xid);
                                            setRatingData(summary);
                                            const ratings = await RatingService.getByPlace(selectedPlace.xid);
                                            setAllRatings(ratings);
                                          } catch (e) {
                                            console.error('Erro ao deletar avaliação:', e);
                                          }
                                        },
                                      },
                                    ]
                                  );
                                }}
                              >
                                <IconSymbol name="trash" size={18} color="#ef4444" />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>

                        {r.comment ? (
                          <Text style={styles.reviewComment}>{r.comment}</Text>
                        ) : null}
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
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: '#f9f9f9',
    flex: 1,
    justifyContent: 'center',
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 8 },
  emptyDesc: { fontSize: 15, color: '#888', textAlign: 'center' },

  headerCard: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  headerLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  headerDates: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  activeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ade80', marginBottom: 4 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8a9ab0',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 16,
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
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  timeText: { fontSize: 13, fontWeight: '700' },
  placeName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  categoryBadge: {
    backgroundColor: '#eef2f7', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  categoryText: { fontSize: 12, fontWeight: '600', color: '#4a5568' },
  feeBadge: {
    backgroundColor: '#fff7ed', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  feeText: { fontSize: 12, fontWeight: '600', color: '#c2410c' },
  placeAddress: { fontSize: 13, color: '#8a9ab0', lineHeight: 18, marginBottom: 6 },
  hoursRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 6 },
  hoursIcon: { fontSize: 12, marginTop: 1 },
  hoursText: { fontSize: 12, color: '#6b7280', flex: 1, lineHeight: 17 },
  mapHint: { fontSize: 11, fontWeight: '600', opacity: 0.75 },
  infoSection: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  bottomSheetContent: {
    flex: 1,
    margin: 16,
    gap: 5,
    paddingBottom: 30
  },

  bottomSheetTextPrimary: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PRIMARY,
  },

  bottomSheetTextSecondary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  bottomSheetTextTertiary: {
    fontSize: 16,
    color: '#4a5568',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  ratingDropdown: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },

  ratingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
  },

  ratingInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },

  ratingButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  ratingButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
    marginTop: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: '#4a5568',
    lineHeight: 18,
  },
});
