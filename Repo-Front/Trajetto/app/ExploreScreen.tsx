import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  ActivityIndicator, StyleSheet, Modal,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import CustomInput from '../components/CustomInput';
import { Ionicons } from '@expo/vector-icons';
import { Place, placesService } from '../services';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#006ecf';

function categoryIcon(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('museum')) return '🏛️';
  if (c.includes('monument')) return '🗿';
  if (c.includes('castle')) return '🏰';
  if (c.includes('church')) return '⛪';
  if (c.includes('park')) return '🌳';
  if (c.includes('square')) return '🏙️';
  if (c.includes('fountain')) return '⛲';
  if (c.includes('ruins')) return '🏚️';
  if (c.includes('art')) return '🎨';
  if (c.includes('view')) return '🌄';
  return '📍';
}

function SpotCard({ spot, onPress }: { spot: Place; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.cardIcon}>
        <Text style={styles.cardIconText}>{categoryIcon(spot.category)}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>{spot.name}</Text>
        <Text style={styles.cardCategory} numberOfLines={1}>{spot.category}</Text>
        {spot.address ? <Text style={styles.cardAddress} numberOfLines={1}>{spot.address}</Text> : null}
      </View>
      <Text style={styles.cardArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const router = useRouter();

  const [spots, setSpots] = useState<Place[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [tempCategory, setTempCategory] = useState('');
  const [searched, setSearched] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carrega categorias ao montar
  useEffect(() => {
    placesService.getCategories().then(setCategories).catch(() => { });
    fetchSpots('', '');
  }, []);

  const fetchSpots = async (searchTerm: string, category: string) => {
    setLoading(true);
    try {
      const results = await placesService.getAll({
        search: searchTerm || undefined,
        category: category || undefined,
      });
      setSpots(results);
      setSearched(true);
    } catch {
      setSpots([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce na search bar
  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSpots(text, selectedCategory);
    }, 400);
  };

  const handleApplyFilter = () => {
    setSelectedCategory(tempCategory);
    setShowFilter(false);
    fetchSpots(search, tempCategory);
  };

  const handleClearFilter = () => {
    setTempCategory('');
    setSelectedCategory('');
    setShowFilter(false);
    fetchSpots(search, '');
  };

  const handleSpotPress = (spot: Place) => {
    router.push({ pathname: '/SpotDetailScreen', params: { spot: JSON.stringify(spot) } });
  };

  const activeFilters = [selectedCategory].filter(Boolean).length;
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.safe}>
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={32} color={'white'} />
            </TouchableOpacity>
            <Text style={styles.headerText}>Explorar</Text>
          </View>
        </View>
      </View>
      <KeyboardAvoidingView style={[styles.container]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Explorar</Text>
          <Text style={styles.headerSubtitle}>Descubra pontos turísticos em Roma</Text>
        </View>

        {/* Search + Filter */}
        <View style={styles.searchRow}>
          <CustomInput
            placeholder="Buscar ponto turístico..."
            value={search}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCorrect={false}
            style={{ flex: 1, marginBottom: 0 }}
            inputWrapperStyle={{ backgroundColor: '#fff' }}
            leftIcon={<Ionicons name="search" size={20} color="#9CA3AF" />}
          />
          <TouchableOpacity
            style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]}
            onPress={() => { setTempCategory(selectedCategory); setShowFilter(true); }}
            activeOpacity={0.8}
          >
            <Ionicons name="filter" size={20} color={activeFilters > 0 ? PRIMARY : "#9CA3AF"} />
            {activeFilters > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilters}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Filtros ativos */}
        {selectedCategory ? (
          <View style={styles.activeFilterRow}>
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>{selectedCategory}</Text>
              <TouchableOpacity onPress={handleClearFilter}>
                <Text style={styles.activeFilterClose}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Contador */}
        {searched && !loading && (
          <Text style={styles.resultsLabel}>
            {spots.length} {spots.length === 1 ? 'resultado' : 'resultados'}
            {selectedCategory ? ` em "${selectedCategory}"` : ''}
          </Text>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.loadingText}>Buscando pontos turísticos...</Text>
          </View>
        )}

        {/* Lista */}
        {!loading && (
          <FlatList
            data={spots}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            renderItem={({ item }) => (
              <SpotCard spot={item} onPress={() => handleSpotPress(item)} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>{searched ? '😕' : '🗺️'}</Text>
                <Text style={styles.emptyTitle}>
                  {searched ? 'Nenhum resultado' : 'Explore Roma'}
                </Text>
                <Text style={styles.emptyText}>
                  {searched
                    ? 'Tente outros filtros ou limpe a busca.'
                    : 'Busque ou filtre pontos turísticos disponíveis.'}
                </Text>
                {searched && (
                  <TouchableOpacity style={styles.clearBtn} onPress={handleClearFilter}>
                    <Text style={styles.clearBtnText}>Limpar filtros</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
            contentContainerStyle={spots.length === 0 ? styles.listEmpty : styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}

      </KeyboardAvoidingView>

      {/* Modal de Filtro */}
      <Modal visible={showFilter} transparent animationType="slide" onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilter(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Filtrar por categoria</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {/* Opção "Todas" */}
              <TouchableOpacity
                style={[styles.categoryItem, tempCategory === '' && styles.categoryItemSelected]}
                onPress={() => setTempCategory('')}
              >
                <Text style={[styles.categoryItemText, tempCategory === '' && styles.categoryItemTextSelected]}>
                  📍 Todas as categorias
                </Text>
                {tempCategory === '' && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>

              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryItem, tempCategory === cat && styles.categoryItemSelected]}
                  onPress={() => setTempCategory(cat)}
                >
                  <Text style={[styles.categoryItemText, tempCategory === cat && styles.categoryItemTextSelected]}>
                    {categoryIcon(cat)} {cat}
                  </Text>
                  {tempCategory === cat && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearFilterBtn} onPress={handleClearFilter}>
                <Text style={styles.clearFilterBtnText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyFilter}>
                <Text style={styles.applyBtnText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f6f9' },
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: '#f4f6f9' },

  header: { paddingTop: 24, paddingBottom: 8 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },

  searchRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 8 },
  input: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#111827',
  },
  filterBtn: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: '#EEF2FF', borderColor: PRIMARY },
  filterIcon: { fontSize: 20 },
  filterBadge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: PRIMARY, borderRadius: 8,
    width: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  activeFilterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  activeFilterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: PRIMARY,
  },
  activeFilterText: { fontSize: 13, color: PRIMARY, fontWeight: '600' },
  activeFilterClose: { fontSize: 13, color: PRIMARY, fontWeight: 'bold' },

  resultsLabel: { fontSize: 13, color: '#6B7280', marginBottom: 8 },

  loadingContainer: { alignItems: 'center', marginTop: 48, gap: 12 },
  loadingText: { fontSize: 14, color: '#6B7280' },

  list: { paddingBottom: 32 },
  listEmpty: { flex: 1 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#EEF2FF', alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  cardIconText: { fontSize: 22 },
  cardContent: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  cardCategory: { fontSize: 12, color: PRIMARY, marginTop: 2, fontWeight: '500', textTransform: 'capitalize' },
  cardAddress: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  cardArrow: { fontSize: 22, color: '#D1D5DB', marginLeft: 8 },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 48 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
  clearBtn: { marginTop: 16, backgroundColor: PRIMARY, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  clearBtnText: { color: '#fff', fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 40,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  categoryItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  categoryItemSelected: { backgroundColor: '#F0F4FF', borderRadius: 8, paddingHorizontal: 8 },
  categoryItemText: { fontSize: 15, color: '#374151', textTransform: 'capitalize' },
  categoryItemTextSelected: { color: PRIMARY, fontWeight: '700' },
  checkmark: { color: PRIMARY, fontSize: 16, fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  clearFilterBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    paddingVertical: 14, alignItems: 'center',
  },
  clearFilterBtnText: { color: '#6B7280', fontWeight: '600', fontSize: 15 },
  applyBtn: { flex: 2, backgroundColor: PRIMARY, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  headerWrapper: { paddingHorizontal: 24, backgroundColor: PRIMARY },
  headerRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', height: 56 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  headerBackBtn: { paddingVertical: 4, paddingRight: 8, marginLeft: -12 },
  headerText: { fontSize: 18, fontWeight: '700', color: 'white' },
  headerCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },

});