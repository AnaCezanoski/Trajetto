import React from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GenerateItineraryFlow from '@/components/GenerateItineraryFlow';
import CustomButton from '@/components/CustomButton';
import { useColors } from '@/src/theme';
import { useRoteiros } from './hooks/useRoteiros';
import { styles } from './styles/styles';
import AdminBanners from './components/AdminBanners/AdminBanners';
import ExploreBanner from './components/ExploreBanner/ExploreBanner';
import ActiveItineraryCard from './components/ActiveItineraryCard/ActiveItineraryCard';
import InactiveItineraryRow from './components/InactiveItineraryRow/InactiveItineraryRow';
import EmptyState from './components/EmptyState/EmptyState';
import SelectBar from './components/SelectBar/SelectBar';

export default function Roteiros() {
  const colors = useColors();
  const s = styles(colors);
  const {
    destIndex,
    user,
    router,
    itinerary,
    itineraries,
    loading,
    deleting,
    activating,
    showGenerate,
    setShowGenerate,
    selectMode,
    selectedIds,
    bulkDeleting,
    enterSelectMode,
    exitSelectMode,
    toggleSelect,
    selectAll,
    handleDelete,
    handleBulkDelete,
    handleActivate,
  } = useRoteiros();

  const inactiveItineraries = itineraries.filter((i) => !i.active);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <View style={s.header}>
        {selectMode ? (
          <>
            <TouchableOpacity onPress={exitSelectMode} activeOpacity={0.8}>
              <Text style={s.cancelSelectText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={Platform.OS === 'ios' ? s.headerTitleIos : s.headerTitleAndroid}>
              {selectedIds.size} selecionado{selectedIds.size !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity onPress={selectAll} activeOpacity={0.8}>
              <Text style={s.selectAllText}>Todos</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View>
              <Text style={Platform.OS === 'ios' ? s.headerTitleIos : s.headerTitleAndroid}>Meus Roteiros</Text>
              <Text style={Platform.OS === 'ios' ? s.headerSubIos : s.headerSubAndroid}>Olá, {user?.firstName} 👋</Text>
            </View>
            <TouchableOpacity
              style={s.avatarBtn}
              onPress={() => router.push('/perfil')}
              activeOpacity={0.8}
            >
              <Ionicons name="person" size={24} color={colors.white} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {!selectMode && user?.isAdmin && (
        <AdminBanners
          onPressUsers={() => router.push('/UserListScreen')}
          onPressDashboard={() => router.push('/DashboardScreen')}
        />
      )}

      <ScrollView
        contentContainerStyle={[s.content, { flexGrow: 1 }]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={s.centerState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={s.stateText}>Carregando roteiros...</Text>
          </View>
        ) : itinerary ? (
          <>
            {!selectMode && (
              <ExploreBanner onPress={() => router.push('/ExploreScreen')} />
            )}
            <Text style={s.sectionLabel}>ROTEIRO ATIVO</Text>

            <ActiveItineraryCard
              itinerary={itinerary}
              selectMode={selectMode}
              selected={selectedIds.has(itinerary.id)}
              deleting={deleting === itinerary.id}
              onPress={() => selectMode ? toggleSelect(itinerary.id) : router.push('/itinerario')}
              onLongPress={() => !selectMode && enterSelectMode(itinerary.id)}
              onDelete={() => handleDelete(itinerary.id)}
            />

            {inactiveItineraries.length > 0 && (
              <>
                <Text style={[s.sectionLabel, s.sectionLabelSpaced]}>OUTROS ROTEIROS</Text>
                {inactiveItineraries.map((item) => (
                  <InactiveItineraryRow
                    key={item.id}
                    item={item}
                    selectMode={selectMode}
                    selected={selectedIds.has(item.id)}
                    activating={activating === item.id}
                    deleting={deleting === item.id}
                    onPress={() => selectMode && toggleSelect(item.id)}
                    onLongPress={() => !selectMode && enterSelectMode(item.id)}
                    onActivate={() => handleActivate(item.id)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </>
            )}
          </>
        ) : (
          <EmptyState destIndex={destIndex} />
        )}

        {!selectMode && (
          <View style={[s.generateSection, !itinerary && s.generateSectionEmpty]}>
            {itineraries.length > 0 && itinerary && (
              <Text style={s.generateLabel}>Quer um novo roteiro?</Text>
            )}
            <CustomButton
              title="Gerar Roteiro"
              onPress={() => setShowGenerate(true)}
            />
          </View>
        )}
      </ScrollView>

      {selectMode && (
        <SelectBar
          count={selectedIds.size}
          bulkDeleting={bulkDeleting}
          onBulkDelete={handleBulkDelete}
        />
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
