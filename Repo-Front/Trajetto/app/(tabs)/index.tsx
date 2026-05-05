import GenerateItineraryFlow from '@/components/GenerateItineraryFlow';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { isPlacePast } from '../utils/isPlacePast';
import { Itinerary, useItineraryStore } from './../../hooks/itineraryStore';

function RatingSection({ itinerary }: { itinerary: Itinerary }) {
  const rateItinerary = useItineraryStore(s => s.rateItinerary);
  const [desc, setDesc] = useState(itinerary.ratingDescription ?? '');
  const [savingRating, setSavingRating] = useState(false);
  const [savingDesc, setSavingDesc] = useState(false);
  const currentRating = itinerary.rating ?? 0;
  const descChanged = desc !== (itinerary.ratingDescription ?? '');

  const handleStarPress = async (star: number) => {
    const newRating = currentRating === star ? 0 : star;
    setSavingRating(true);
    try {
      await rateItinerary(itinerary.id, newRating, itinerary.ratingDescription ?? null);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a avaliação.');
    } finally {
      setSavingRating(false);
    }
  };

  const handleSaveDesc = async () => {
    setSavingDesc(true);
    try {
      await rateItinerary(itinerary.id, itinerary.rating ?? null, desc || null);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o comentário.');
    } finally {
      setSavingDesc(false);
    }
  };

  return (
    <View style={ratingStyles.container}>
      <View style={ratingStyles.starsRow}>
        <Text style={ratingStyles.label}>Avaliação</Text>
        {savingRating ? (
          <ActivityIndicator size="small" color="#f59e0b" />
        ) : (
          <View style={ratingStyles.stars}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => handleStarPress(star)} activeOpacity={0.7}>
                <Text style={star <= currentRating ? ratingStyles.starFilled : ratingStyles.starEmpty}>
                  {star <= currentRating ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <TextInput
        style={ratingStyles.descInput}
        placeholder="Comentário sobre o roteiro..."
        placeholderTextColor="#b0bec5"
        value={desc}
        onChangeText={setDesc}
        multiline
        numberOfLines={2}
      />
      {descChanged && (
        <TouchableOpacity
          style={ratingStyles.saveBtn}
          onPress={handleSaveDesc}
          disabled={savingDesc}
          activeOpacity={0.8}
        >
          {savingDesc
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={ratingStyles.saveBtnText}>Salvar comentário</Text>
          }
        </TouchableOpacity>
      )}
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  container: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f4f8',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8a9ab0',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stars: { flexDirection: 'row', gap: 4 },
  starFilled: { fontSize: 24, color: '#f59e0b' },
  starEmpty: { fontSize: 24, color: '#d1d5db' },
  descInput: {
    borderWidth: 1,
    borderColor: '#e8edf3',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#1a1a1a',
    backgroundColor: '#f8fafc',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveBtn: {
    marginTop: 8,
    backgroundColor: '#023665',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});

const PRIMARY = '#023665';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const formatTime = (time: string) => time?.slice(0, 5) ?? '';

export default function RoteirosTab() {
  const { user } = useAuth();
  const router = useRouter();
  const { itinerary, itineraries, loading, fetchAllItineraries, deleteItinerary, activateItinerary } = useItineraryStore();
  const [deleting, setDeleting] = useState<number | null>(null);
  const [activating, setActivating] = useState<number | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

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
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o roteiro.');
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
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir alguns roteiros.');
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
    } catch {
      Alert.alert('Erro', 'Não foi possível ativar o roteiro.');
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
    <SafeAreaView style={styles.safe}>
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
              <Text style={styles.avatarBtnText}>👤</Text>
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
                <Text style={[styles.itineraryCardTitle, { flex: 1 }]} numberOfLines={1}>
                  📍 {itinerary.places[0]?.name ?? 'Roteiro'}
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
              {!selectMode && <RatingSection itinerary={itinerary} />}
            </TouchableOpacity>

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
                    <Text style={styles.deleteBtnIcon}>🗑️</Text>
                    <Text style={styles.deleteBtnText}>Excluir roteiro</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

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
                        <Text style={styles.inactiveCardTitle} numberOfLines={1}>
                          📍 {item.places[0]?.name ?? 'Roteiro'}
                        </Text>
                        <Text style={styles.inactiveCardMeta}>
                          {item.places.length} paradas · {formatDate(item.startDate)}
                        </Text>
                      </View>
                      {!selectMode && (
                        <>
                          <TouchableOpacity
                            style={styles.activateBtn}
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
                              : <Text style={styles.inactiveDeleteIcon}>🗑️</Text>
                            }
                          </TouchableOpacity>
                        </>
                      )}
                    </TouchableOpacity>
                    {!selectMode && <RatingSection itinerary={item} />}
                  </View>
                ))}
              </>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyTitle}>Nenhum roteiro ainda</Text>
            <Text style={styles.emptyDesc}>
              Crie seu primeiro roteiro personalizado e comece a explorar o mundo.
            </Text>
          </View>
        )}

        {!selectMode && (
          <View style={[styles.generateSection, !itinerary ? { backgroundColor: '#f4f6f9', flex: 1 } : {}]}>
            <Text style={styles.generateLabel}>Quer um novo roteiro?</Text>
            <TouchableOpacity
              style={styles.generateBtn}
              activeOpacity={0.85}
              onPress={() => setShowGenerate(true)}
            >
              <Text style={styles.generateBtnIcon}>✨</Text>
              <Text style={styles.generateBtnTitle}>Gerar Roteiro</Text>
            </TouchableOpacity>
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
  safe: { flex: 1, backgroundColor: '#023665' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: PRIMARY,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  cancelSelectText: { fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  selectAllText: { fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  avatarBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarBtnText: { fontSize: 22 },

  adminBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#ffeaa0',
  },
  adminBannerIcon: { fontSize: 18, marginRight: 10 },
  adminBannerText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#7a5f00' },
  adminBannerArrow: { fontSize: 20, color: '#c0a000' },

  content: { padding: 20, paddingBottom: 32, backgroundColor: '#f4f6f9' },

  centerState: { alignItems: 'center', paddingTop: 60 },
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
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
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

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: '#fca5a5', borderRadius: 12,
    paddingVertical: 13, backgroundColor: '#fff5f5', marginBottom: 24, minHeight: 48,
  },
  deleteBtnIcon: { fontSize: 16 },
  deleteBtnText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },

  emptyState: {
    alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32,
    backgroundColor: '#f4f6f9', flex: 1, justifyContent: 'center',
  },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  emptyDesc: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },

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
  inactiveDeleteIcon: { fontSize: 16 },

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
});
