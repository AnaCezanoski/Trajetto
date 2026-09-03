import React from 'react';
import { ActivityIndicator, Keyboard, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import CustomInput from '@/components/CustomInput';
import { useColors } from '@/src/theme';
import NoItineraryEmptyState from '@/src/pages/tabs/shared/components/NoItineraryEmptyState/NoItineraryEmptyState';
import { useMapa } from './hooks/useMapa';
import { styles } from './styles/styles';
import RouteLines from './components/RouteLines/RouteLines';
import OriginMarker from './components/OriginMarker/OriginMarker';
import PlaceMarkers from './components/PlaceMarkers/PlaceMarkers';
import SearchPin from './components/SearchPin/SearchPin';
import RouteBar from './components/RouteBar/RouteBar';
import ActiveFilterChips from './components/ActiveFilterChips/ActiveFilterChips';
import SuggestionsList from './components/SuggestionsList/SuggestionsList';
import SpotDetailCard from './components/SpotDetailCard/SpotDetailCard';
import FilterModal from './components/FilterModal/FilterModal';

export default function Mapa() {
  const colors = useColors();
  const s = styles(colors);
  const {
    destIndex,
    itinerary,
    region,
    segments,
    points,
    mapRef,
    pulseStyle,
    firstUpcomingIdx,
    hasOriginSeg,
    currentSegIdx,
    handlePinPress,
    search,
    suggestions,
    showSuggestions,
    searchLoading,
    selectedSpot,
    setSelectedSpot,
    handleSearchChange,
    handleSelectSuggestion,
    handleClearSearch,
    hideSuggestions,
    showFilter,
    setShowFilter,
    categories,
    profiles,
    activeFilter,
    activeCount,
    tempCategory,
    setTempCategory,
    tempFee,
    setTempFee,
    tempHasHours,
    setTempHasHours,
    tempProfile,
    setTempProfile,
    tempMaxDistance,
    setTempMaxDistance,
    openFilter,
    handleApplyFilter,
    handleClearAllFilters,
    removeFilter,
    spotDistance,
  } = useMapa();

  if (!itinerary) {
    return <NoItineraryEmptyState destIndex={destIndex} />;
  }

  return (
    <View style={s.container}>
      <MapView
        ref={mapRef}
        style={s.map}
        initialRegion={region}
        showsUserLocation
        onPress={() => { hideSuggestions(); Keyboard.dismiss(); }}
      >
        <RouteLines
          segments={segments}
          currentSegIdx={currentSegIdx}
          hasOriginSeg={hasOriginSeg}
          firstUpcomingIdx={firstUpcomingIdx}
        />

        {itinerary.originLatitude != null && itinerary.originLongitude != null && (
          <OriginMarker latitude={itinerary.originLatitude} longitude={itinerary.originLongitude} />
        )}

        <PlaceMarkers
          points={points}
          startDate={itinerary.startDate}
          firstUpcomingIdx={firstUpcomingIdx}
          pulseStyle={pulseStyle}
          onPinPress={handlePinPress}
        />

        {selectedSpot && <SearchPin spot={selectedSpot} />}
      </MapView>

      <View style={s.searchWrapper}>
        <CustomInput
          placeholder="Buscar ponto turístico..."
          value={search}
          onChangeText={handleSearchChange}
          returnKeyType="search"
          autoCorrect={false}
          style={{ marginBottom: 0 }}
          inputWrapperStyle={s.searchBar}
          inputStyle={s.searchInput}
          leftIcon={
            searchLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="search" size={20} color={colors.gray400} />
            )
          }
          rightElement={
            <View style={s.filterBtnWrapper}>
              {search.length > 0 && (
                <TouchableOpacity onPress={handleClearSearch} style={s.clearBtn}>
                  <Text style={s.clearBtnText}>✕</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[s.filterBtn, activeCount > 0 && s.filterBtnActive]} onPress={openFilter} activeOpacity={0.8}>
                <Ionicons name="filter" size={20} color={activeCount > 0 ? colors.primary : colors.gray400} />
                {activeCount > 0 && (
                  <View style={s.filterBadge}>
                    <Text style={s.filterBadgeText}>{activeCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          }
        />

        {currentSegIdx >= 0 && firstUpcomingIdx < points.length && (
          <RouteBar
            firstUpcomingIdx={firstUpcomingIdx}
            hasOriginSeg={hasOriginSeg}
            placeName={points[firstUpcomingIdx]?.name}
          />
        )}

        {activeCount > 0 && (
          <ActiveFilterChips activeFilter={activeFilter} onRemove={removeFilter} />
        )}

        {showSuggestions && (
          <SuggestionsList suggestions={suggestions} onSelect={handleSelectSuggestion} />
        )}
      </View>

      {selectedSpot && (
        <SpotDetailCard
          spot={selectedSpot}
          distanceMeters={spotDistance}
          onClose={() => setSelectedSpot(null)}
        />
      )}

      <FilterModal
        visible={showFilter}
        categories={categories}
        profiles={profiles}
        activeCount={activeCount}
        tempCategory={tempCategory}
        setTempCategory={setTempCategory}
        tempFee={tempFee}
        setTempFee={setTempFee}
        tempHasHours={tempHasHours}
        setTempHasHours={setTempHasHours}
        tempProfile={tempProfile}
        setTempProfile={setTempProfile}
        tempMaxDistance={tempMaxDistance}
        setTempMaxDistance={setTempMaxDistance}
        onApply={handleApplyFilter}
        onClearAll={handleClearAllFilters}
        onClose={() => setShowFilter(false)}
      />
    </View>
  );
}
