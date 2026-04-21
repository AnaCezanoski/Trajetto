import GenerateItineraryFlow from '@/components/GenerateItineraryFlow';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { isPlacePast } from '../utils/isPlacePast';
import { Itinerary, useItineraryStore } from './../../hooks/itineraryStore';


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
  const { itinerary, loading, fetchItinerary, deleteItinerary } = useItineraryStore();
  const [deleting, setDeleting] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);

  useEffect(() => {
    if (user?.id) fetchItinerary(user.id);
  }, [user]);

  const handleDelete = () => {
    if (!itinerary || !user) return;
    Alert.alert(
      'Excluir roteiro',
      'Tem certeza que deseja excluir este roteiro? Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteItinerary(itinerary.id, user.id);
            } catch {
              Alert.alert('Erro', 'Não foi possível excluir o roteiro.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
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
      </View>

      {/* Admin badge */}
      {user?.isAdmin && (
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

            {/* Card clicável para abrir o roteiro */}
            <TouchableOpacity
              style={styles.itineraryCard}
              onPress={() => router.push('/itinerario')}
              activeOpacity={0.9}
            >
              {/* Cabeçalho do card */}
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
                <Text style={styles.chevron}>›</Text>
              </View>

              <Text style={styles.itineraryCardSub}>
                {itinerary.places.length} paradas ·{' '}
                {Math.ceil(
                  (new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1}{' '}
                dias
              </Text>

              {/* Timeline resumida */}
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
                  )
})}
              </View>
            </TouchableOpacity>

            {/* Botão deletar separado do card */}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              disabled={deleting}
              activeOpacity={0.8}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Text style={styles.deleteBtnIcon}>🗑️</Text>
                  <Text style={styles.deleteBtnText}>Excluir roteiro</Text>
                </>
              )}
            </TouchableOpacity>
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

        {/* Botão Gerar Roteiro */}
        <View style={[styles.generateSection, !itinerary ? { backgroundColor: '#f4f6f9', flex:1} : {}]}>
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
      </ScrollView>

      <GenerateItineraryFlow
        visible={showGenerate}
        onClose={() => setShowGenerate(false)}
        onAccept={(itinerary: Itinerary) => {
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
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  avatarBtnText: { fontSize: 22 },

  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ffeaa0',
  },
  adminBannerIcon: { fontSize: 18, marginRight: 10 },
  adminBannerText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#7a5f00' },
  adminBannerArrow: { fontSize: 20, color: '#c0a000' },

  content: { padding: 20, paddingBottom: 32, backgroundColor: '#f4f6f9' },

  centerState: { alignItems: 'center', paddingTop: 60 },
  stateText: { marginTop: 16, fontSize: 15, color: '#888' },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8a9ab0',
    letterSpacing: 0.8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },

  itineraryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  itineraryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: 12,
    paddingVertical: 13,
    backgroundColor: '#fff5f5',
    marginBottom: 24,
    minHeight: 48,
  },
  deleteBtnIcon: { fontSize: 16 },
  deleteBtnText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },

      emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    backgroundColor: '#f4f6f9',
    flex: 1,
    justifyContent: 'center',
  },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
  emptyDesc: { fontSize: 15, color: '#888', textAlign: 'center', lineHeight: 22 },

  generateSection: { marginTop: 8 },
  generateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8a9ab0',
    letterSpacing: 0.8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  generateBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  generateBtnIcon: { fontSize: 24 },
  generateBtnTitle: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
});
