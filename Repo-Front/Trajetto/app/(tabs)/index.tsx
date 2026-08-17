import GenerateItineraryFlow from '@/components/GenerateItineraryFlow';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/apiError';
import { isPlacePast } from '../utils/isPlacePast';
import { Itinerary, useItineraryStore } from './../../hooks/itineraryStore';
import { Platform } from 'react-native';
import CustomButton from '../../components/CustomButton';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#006ecf';


const DESTINATIONS = [
  {
    title: 'Tokyo',
    subtitle: 'Japão',
    time: '14h voo',
    image: require('@/assets/appImgs/tokyoImg.jpg'),
    bgColor: '#1a1a1a',
  },
  {
    title: 'Paris',
    subtitle: 'França',
    time: '11h voo',
    image: require('@/assets/appImgs/parisImg.jpg'),
    bgColor: '#e85d9b',
  },
  {
    title: 'NYC',
    subtitle: 'EUA',
    time: '9h voo',
    image: require('@/assets/appImgs/nycImg.jpg'),
    bgColor: '#3b82f6',
  },

  {
    title: 'Roma',
    subtitle: 'Itália',
    time: '12h voo',
    image: require('@/assets/appImgs/romeImg.jpg'),
    bgColor: '#c7be40',
  },
  {
    title: 'Veneza',
    subtitle: 'Itália',
    time: '12h voo',
    image: require('@/assets/appImgs/veniceImg.jpg'),
    bgColor: '#aa88da',
  },

  {
    title: 'Curitiba',
    subtitle: 'Brasil',
    time: '2h voo',
    image: require('@/assets/appImgs/jdBotanicoImg.jpg'),
    bgColor: '#85d363',
  },
];

function DestinationCard({
  title, subtitle, time, image, bgColor, rotation, style, animKey,
}: {
  title: string;
  subtitle: string;
  time: string;
  image: ImageSourcePropType;
  bgColor: string;
  rotation: string;
  style?: object;
  animKey: number;
}) {
  const swing = useSharedValue(0);

  useEffect(() => {
    swing.value = withSequence(
      withTiming(-8, { duration: 80, easing: Easing.out(Easing.quad) }),
      withTiming(6, { duration: 80, easing: Easing.out(Easing.quad) }),
      withTiming(-4, { duration: 70, easing: Easing.out(Easing.quad) }),
      withTiming(2, { duration: 70, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 60, easing: Easing.out(Easing.quad) }),
    );
  }, [animKey]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: rotation },
      { rotate: `${swing.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[cardStyles.card, { backgroundColor: bgColor, transform: [{ rotate: rotation }] }, style, animStyle]}>
      <View style={cardStyles.cardTop}>
        <Text style={cardStyles.cardTitle}
          adjustsFontSizeToFit
          numberOfLines={1}
        >{title}</Text>
        <View style={cardStyles.timeBadge}>
          <Text style={cardStyles.timeText}
            adjustsFontSizeToFit
            numberOfLines={1}
          >{time}</Text>
        </View>
      </View>
      <Text style={cardStyles.cardSubtitle}>{subtitle}</Text>
      <Image source={image} style={cardStyles.cardImage} />
    </Animated.View>
  );
}


const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const formatTime = (time: string) => time?.slice(0, 5) ?? '';

export default function RoteirosTab() {
  const [destIndex, setDestIndex] = useState(0);

  const { user } = useAuth();
  const router = useRouter();
  const { itinerary, itineraries, loading, fetchAllItineraries, deleteItinerary, activateItinerary } = useItineraryStore();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [activating, setActivating] = useState<number | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDestIndex(prev => (prev + 1) % DESTINATIONS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) fetchAllItineraries(user.id);
    }, [user?.id])
  );

  // Exit select mode when itineraries change (after bulk delete)
  useEffect(() => {
    if (selectMode && itineraries.length === 0) exitSelectMode();
  }, [itineraries]);

  const enterSelectMode = (id: number) => {
    setSelectMode(true);
    setSelectedIds(new Set([id]));
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(itineraries.map(i => i.id)));

  const handleDelete = (id: number) => {
    if (!user) return;
    Alert.alert(
      'Excluir roteiro',
      'Tem certeza que deseja excluir este roteiro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(id);
              await deleteItinerary(id, user.id);
            } catch (e) {
              Alert.alert('Erro', getErrorMessage(e, 'Não foi possível excluir o roteiro.'));
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  const handleBulkDelete = () => {
    if (!user || selectedIds.size === 0) return;
    Alert.alert(
      'Excluir roteiros',
      `Excluir ${selectedIds.size} roteiro${selectedIds.size > 1 ? 's' : ''}? Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setBulkDeleting(true);
            try {
              await Promise.all([...selectedIds].map(id => deleteItinerary(id, user.id)));
              exitSelectMode();
            } catch (e) {
              Alert.alert('Erro', getErrorMessage(e, 'Não foi possível excluir alguns roteiros.'));
            } finally {
              setBulkDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleActivate = async (id: number) => {
    if (!user) return;
    try {
      setActivating(id);
      await activateItinerary(id, user.id);
    } catch (e) {
      Alert.alert('Erro', getErrorMessage(e, 'Não foi possível ativar o roteiro.'));
    } finally {
      setActivating(null);
    }
  };

  const Checkbox = ({ id }: { id: number }) => (
    <View style={[styles.checkbox, selectedIds.has(id) && styles.checkboxSelected]}>
      {selectedIds.has(id) && <Text style={styles.checkmark}>✓</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        
        {selectMode ? (
          <>
            <TouchableOpacity onPress={exitSelectMode} activeOpacity={0.8}>
              <Text style={styles.cancelSelectText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {selectedIds.size} selecionado{selectedIds.size !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={selectAll} activeOpacity={0.8}>
              <Text style={styles.selectAllText}>Todos</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View>
              <Text style={styles.headerTitle}>Meus Roteiros</Text>
              <Text style={styles.headerSub}>Olá, {user?.firstName} 👋</Text>
            </View>
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => router.push('/perfil')}
              activeOpacity={0.8}
            >
              <Ionicons name="person" size={24} color="white" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Admin badge */}
      {!selectMode && user?.isAdmin && (
        <TouchableOpacity
          style={styles.adminBanner}
          onPress={() => router.push('/UserListScreen')}
          activeOpacity={0.8}
        >
          <Text style={styles.adminBannerIcon}>🛡️</Text>
          <Text style={styles.adminBannerText}>Painel Administrador</Text>
          <Text style={styles.adminBannerArrow}>›</Text>
        </TouchableOpacity>
      )}

    {!selectMode && user?.isAdmin && (
      <TouchableOpacity
        style={styles.dashboardBanner}
        onPress={() => router.push('/DashboardScreen')}
        activeOpacity={0.8}
      >
        <Text style={styles.adminBannerIcon}>📊</Text>
        <Text style={styles.adminBannerText}>Dashboard de uso</Text>
        <Text style={styles.adminBannerArrow}>›</Text>
      </TouchableOpacity>
    )}

      <ScrollView
        contentContainerStyle={[styles.content, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.stateText}>Carregando roteiros...</Text>
          </View>
        ) : itinerary ? (
          <>
          {!selectMode && (
  <TouchableOpacity
    style={styles.exploreBanner}
    onPress={() => router.push('/ExploreScreen')} // ← troque pela rota que quiser
    activeOpacity={0.92}
  >
    {/* Imagem de fundo via URL pública de praia */}
    <Image
      source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' }}
      style={StyleSheet.absoluteFillObject}
      resizeMode="cover"
    />
    {/* Gradiente escuro para legibilidade */}
    <View style={styles.exploreBannerOverlay} />

    <View style={styles.exploreBannerContent}>
      <View style={styles.exploreBannerTag}>
        <Text style={styles.exploreBannerTagText}>✈️  Destinos</Text>
      </View>
      <Text style={styles.exploreBannerTitle}>Explore mais{'\n'}lugares para ir</Text>
      <View style={styles.exploreBannerBtn}>
        <Text style={styles.exploreBannerBtnText}>Descobrir agora →</Text>
      </View>
    </View>
  </TouchableOpacity>
)}
            <Text style={styles.sectionLabel}>ROTEIRO ATIVO</Text>

            <TouchableOpacity
              style={[styles.itineraryCard, selectMode && selectedIds.has(itinerary.id) && styles.cardSelected]}
              onPress={() => selectMode ? toggleSelect(itinerary.id) : router.push('/itinerario')}
              onLongPress={() => !selectMode && enterSelectMode(itinerary.id)}
              activeOpacity={0.9}
            >
              {selectMode && (
                <View style={styles.checkboxRow}>
                  <Checkbox id={itinerary.id} />
                </View>
              )}
              <View style={styles.itineraryCardHeader}>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeBadgeText}>Ativo</Text>
                </View>
                <Text style={styles.itineraryDates}>
                  {formatDate(itinerary.startDate)} → {formatDate(itinerary.endDate)}
                </Text>
              </View>

              <View style={styles.titleRow}>
                <Ionicons name="location" size={18} color={PRIMARY} style={{ marginBottom: 5 }} />
                <Text style={[styles.itineraryCardTitle, { flex: 1 }]} numberOfLines={1}>
                  {itinerary.places[0]?.name ?? 'Roteiro'}
                </Text>
                {!selectMode && <Text style={styles.chevron}>›</Text>}
              </View>

              <Text style={styles.itineraryCardSub}>
                {itinerary.places.length} paradas ·{' '}
                {Math.ceil(
                  (new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)
                ) + 1}{' '}
                dias
              </Text>

              {!selectMode && (
                <View style={styles.timeline}>
                  {itinerary.places
                    .slice()
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((place, idx) => {
                      const isPast = isPlacePast(itinerary.startDate, place.estimatedVisitTime);
                      return (
                        <View key={idx} style={styles.timelineItem}>
                          <View style={styles.timelineLeft}>
                            <View style={[styles.timelineDot, isPast ? { backgroundColor: '#9aa4b2', opacity: 0.5 } : { backgroundColor: idx === 0 ? PRIMARY : '#4a90d9' }]} />
                            {idx < itinerary.places.length - 1 && <View style={styles.timelineLine} />}
                          </View>
                          <View style={[styles.timelineContent, isPast && { opacity: 0.5 }]}>
                            <Text style={styles.timelineTime}>{formatTime(place.estimatedVisitTime)}</Text>
                            <Text style={styles.timelineName} numberOfLines={1}>{place.name}</Text>
                            <Text style={styles.timelineAddress} numberOfLines={1}>{place.address}</Text>
                          </View>
                        </View>
                      );
                    })}
                </View>
              )}

              {!selectMode && <View style={styles.divider} />}
              {!selectMode && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(itinerary.id)}
                  disabled={deleting === itinerary.id}
                  activeOpacity={0.8}
                >
                  {deleting === itinerary.id ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      <Text style={styles.deleteBtnText}>Excluir roteiro</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </TouchableOpacity>



            {/* Outros roteiros */}
            {itineraries.filter(i => !i.active).length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 8 }]}>OUTROS ROTEIROS</Text>
                {itineraries.filter(i => !i.active).map(item => (
                  <View
                    key={item.id}
                    style={[styles.inactiveCard, selectMode && selectedIds.has(item.id) && styles.cardSelected]}
                  >
                    <TouchableOpacity
                      style={styles.inactiveCardRow}
                      onPress={() => selectMode ? toggleSelect(item.id) : undefined}
                      onLongPress={() => !selectMode && enterSelectMode(item.id)}
                      activeOpacity={selectMode ? 0.9 : 1}
                    >
                      {selectMode && <Checkbox id={item.id} />}
                      <View style={styles.inactiveCardInfo}>
                        <View style={{ flexDirection: 'row' }}>
                          <Ionicons name="location" size={18} color={PRIMARY} />
                          <Text style={styles.inactiveCardTitle} numberOfLines={1}> {item.places[0]?.name ?? 'Roteiro'}
                          </Text>
                        </View>
                        <Text style={styles.inactiveCardMeta}>
                          {item.places.length} paradas · {formatDate(item.startDate)}
                        </Text>
                      </View>
                      {!selectMode && (
                        <>
                          <TouchableOpacity
                            style={[styles.activateBtn, { marginLeft: 15 }]}
                            onPress={() => handleActivate(item.id)}
                            disabled={activating === item.id}
                            activeOpacity={0.8}
                          >
                            {activating === item.id
                              ? <ActivityIndicator size="small" color={PRIMARY} />
                              : <Text style={styles.activateBtnText}>Ativar</Text>
                            }
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.inactiveDeleteBtn}
                            onPress={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            activeOpacity={0.8}
                          >
                            {deleting === item.id
                              ? <ActivityIndicator size="small" color="#EF4444" />
                              : <Ionicons name="trash-outline" size={18} color="#EF4444" />
                            }
                          </TouchableOpacity>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </>
        ) : (
          <View style={{ flex: 1, flexDirection: 'column', gap: 50 }}>
            <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              
              <View style={{ marginTop: 20, flexDirection: 'row', gap: 7, alignItems: 'center' }}>
                <Text style={[styles.emptyBody, { lineHeight: Platform.OS === 'ios' ? 22 : 30 }]}>Crie seu primeiro</Text>
                  <Text style={{marginTop: -7,  fontSize: Platform.OS === 'ios' ? 18 : 25, fontFamily: 'FugazOne', color: PRIMARY, alignSelf: 'center', lineHeight: Platform.OS === 'ios' ? 22 : 30 }}>roteiro</Text>
              </View>
              
              <View style={{ marginTop: -10, flexDirection: 'row', gap: 7, alignItems: 'center' }}>
                <Text style={{marginTop: -7, fontSize: Platform.OS === 'ios' ? 18 : 25, fontFamily: 'FugazOne', color: PRIMARY, alignSelf: 'center', lineHeight: Platform.OS === 'ios' ? 22 : 30 }}>personalizado</Text>
                <Text style={[styles.emptyBody, { lineHeight: Platform.OS === 'ios' ? 24 : 30 }]}>e comece a</Text>
              </View>

              <Text style={[styles.emptyBody, {marginTop: -10, lineHeight: Platform.OS === 'ios' ? 24 : 30 }]}>explorar o mundo.</Text>



            </View>
            <View style={[styles.emptyState, { backgroundColor: '#fff' }]}>
              <View style={styles.cardsStack}>
                <DestinationCard
                  title={DESTINATIONS[destIndex].title}
                  subtitle={DESTINATIONS[destIndex].subtitle}
                  time={DESTINATIONS[destIndex].time}
                  image={DESTINATIONS[destIndex].image}
                  bgColor={DESTINATIONS[destIndex].bgColor}
                  rotation="-6deg"
                  style={{ position: 'absolute', left: 0, top: 20 }}
                  animKey={destIndex}
                />
                <DestinationCard
                  title={DESTINATIONS[(destIndex + 1) % DESTINATIONS.length].title}
                  subtitle={DESTINATIONS[(destIndex + 1) % DESTINATIONS.length].subtitle}
                  time={DESTINATIONS[(destIndex + 1) % DESTINATIONS.length].time}
                  image={DESTINATIONS[(destIndex + 1) % DESTINATIONS.length].image}
                  bgColor={DESTINATIONS[(destIndex + 1) % DESTINATIONS.length].bgColor}
                  rotation="4deg"
                  style={{ position: 'absolute', left: 60, top: 0 }}
                  animKey={destIndex}
                />
                <DestinationCard
                  title={DESTINATIONS[(destIndex + 2) % DESTINATIONS.length].title}
                  subtitle={DESTINATIONS[(destIndex + 2) % DESTINATIONS.length].subtitle}
                  time={DESTINATIONS[(destIndex + 2) % DESTINATIONS.length].time}
                  image={DESTINATIONS[(destIndex + 2) % DESTINATIONS.length].image}
                  bgColor={DESTINATIONS[(destIndex + 2) % DESTINATIONS.length].bgColor}
                  rotation="-2deg"
                  style={{ position: 'absolute', left: 120, top: 30 }}
                  animKey={destIndex}
                />
              </View>
            </View>
          </View>
        )}

        {!selectMode && (
          <View style={[styles.generateSection, !itinerary ? { backgroundColor: '#fff', flex: 1 } : {}]}>
            {itineraries.length > 0 && itinerary && (
              <Text style={styles.generateLabel}>Quer um novo roteiro?</Text>
            )}
            <CustomButton
              title="Gerar Roteiro"
              onPress={() => setShowGenerate(true)}
            />
          </View>
        )}
      </ScrollView>

      {/* Barra de ação do modo seleção */}
      {selectMode && (
        <View style={styles.selectBar}>
          <Text style={styles.selectBarCount}>
            {selectedIds.size} selecionado{selectedIds.size !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            style={[styles.bulkDeleteBtn, selectedIds.size === 0 && styles.bulkDeleteBtnDisabled]}
            onPress={handleBulkDelete}
            disabled={selectedIds.size === 0 || bulkDeleting}
            activeOpacity={0.85}
          >
            {bulkDeleting
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.bulkDeleteBtnText}>🗑️  Excluir ({selectedIds.size})</Text>
            }
          </TouchableOpacity>
        </View>
      )}

      <GenerateItineraryFlow
        visible={showGenerate}
        onClose={() => setShowGenerate(false)}
        onAccept={() => {
          setShowGenerate(false);
          router.push('/itinerario');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PRIMARY },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: { fontSize: Platform.OS === 'ios' ? 16 : 24, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: Platform.OS === 'ios' ? 13 : 18, color: '#d4d4d4', marginTop: 2 },
  cancelSelectText: { fontSize: 15, color: '#ffffff', fontWeight: '500' },
  selectAllText: { fontSize: 15, color: '#ffffff', fontWeight: '500' },
  avatarBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },

  adminBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#ffeaa0',
  },
  adminBannerIcon: { fontSize: 18, marginRight: 10 },
  adminBannerText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#7a5f00' },
  adminBannerArrow: { fontSize: 20, color: '#c0a000' },

  content: { padding: 20, paddingBottom: 32, backgroundColor: '#fff' },

  centerState: { alignItems: 'center', paddingTop: 60, flex: 1, marginVertical: 100 },
  stateText: { marginTop: 16, fontSize: 15, color: '#888' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#8a9ab0',
    letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase',
  },

  itineraryCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: '#f0f4ff',
  },
  checkboxRow: { marginBottom: 10 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: '#c0ccd8',
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  itineraryCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  activeBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e8f5e9', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, gap: 6,
  },
  activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#43a047' },
  activeBadgeText: { fontSize: 12, fontWeight: '700', color: '#2e7d32' },
  itineraryDates: { fontSize: 12, color: '#8a9ab0', fontWeight: '500' },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 5 },
  itineraryCardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  chevron: { fontSize: 22, color: '#c0ccd8', marginLeft: 8 },
  itineraryCardSub: { fontSize: 13, color: '#8a9ab0', marginBottom: 20 },

  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', minHeight: 56 },
  timelineLeft: { alignItems: 'center', width: 20, marginRight: 14 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineLine: { flex: 1, width: 2, backgroundColor: '#e0e8f0', marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineTime: { fontSize: 13, fontWeight: '700', color: PRIMARY, marginBottom: 2 },
  timelineName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  timelineAddress: { fontSize: 12, color: '#8a9ab0' },
  divider: { height: 1, backgroundColor: '#f0f4f8', marginVertical: 12 },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#fca5a5', borderRadius: 12,
    paddingVertical: 13, backgroundColor: '#fff5f5', minHeight: 48,
  },
  deleteBtnText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },

  emptyState: {
    alignItems: 'center',
    backgroundColor: '#fff', flex: 1, justifyContent: 'center',
    paddingLeft: 40,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: '#1a1a1a', marginBottom: 10, textAlign: 'center' },
  emptyBody: { fontSize: Platform.OS === 'ios' ? 16 : 22, fontFamily: 'Inter', color: '#1a1a1a', marginBottom: 10, textAlign: 'center', },
  emptyDesc: { fontSize: 13, color: '#1a1a1a', marginTop: 2, textAlign: 'center', lineHeight: 22 },
  placeholderImg: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    resizeMode: 'cover',
  },
  inactiveCard: {
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  inactiveCardRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  inactiveCardInfo: { flex: 1 },
  inactiveCardTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  inactiveCardMeta: { fontSize: 12, color: '#8a9ab0' },
  activateBtn: {
    borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 7, minWidth: 60, alignItems: 'center',
  },
  activateBtnText: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  inactiveDeleteBtn: { padding: 6 },

  generateSection: { marginTop: 8 },
  generateLabel: {
    fontSize: 11, fontWeight: '700', color: '#8a9ab0',
    letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase',
  },
  generateBtn: {
    backgroundColor: PRIMARY, borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: PRIMARY, shadowOpacity: 0.3, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 5,
    width: '80%', alignSelf: 'center', height: 55,
  },
  generateBtnIcon: { fontSize: 24 },
  generateBtnTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff' },

  selectBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#e8edf3',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 }, elevation: 8,
  },
  selectBarCount: { fontSize: 15, fontWeight: '600', color: '#4a5568' },
  bulkDeleteBtn: {
    backgroundColor: '#EF4444', borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 12, minWidth: 140, alignItems: 'center',
  },
  bulkDeleteBtnDisabled: { backgroundColor: '#fca5a5' },
  bulkDeleteBtnText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },

  cardsStack: {
    width: 320,
    height: 240,
    marginBottom: 32,
    position: 'relative',
  },
  exploreBanner: {
    height: 160,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  exploreBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,20,60,0.52)',
  },
  exploreBannerContent: {
    padding: 20,
    gap: 6,
  },
  exploreBannerTag: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  exploreBannerTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  exploreBannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  exploreBannerBtn: {
    marginTop: 6,
    backgroundColor: PRIMARY,
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  exploreBannerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});

const cardStyles = StyleSheet.create({
  card: {
    width: 160,
    height: 200,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    flex: 1,
  },
  timeBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 2 : 3,
    marginLeft: 6,
    flexShrink: 1,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 10,
  },
  cardImage: {
    width: '100%',
    height: 110,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  dashboardBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#c5d4f8',
  },
});