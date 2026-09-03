import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { categoryIcon } from '@/src/helpers/categoryIcon';
import { useColors } from '@/src/theme';
import { useSpotDetail } from './hooks/useSpotDetail';
import { formatCar, formatDistance, formatWalk } from './spotFormat';
import InfoRow from './components/InfoRow/InfoRow';
import { styles } from './styles/styles';

export default function SpotDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colors = useColors();
  const s = styles(colors);
  const { spot, distance, region, hours, wc, openMaps, openWebsite, callPhone, openWikipedia } = useSpotDetail();

  return (
    <View style={s.safe}>
      <View style={[s.headerWrapper, { paddingTop: insets.top }]}>
        <View style={s.headerRow}>
          <View style={s.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={s.headerBackBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={32} color={colors.white} />
            </TouchableOpacity>
            <Text style={s.headerText}>Explorar</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        <MapView style={s.map} provider={PROVIDER_DEFAULT} initialRegion={region} scrollEnabled zoomEnabled>
          <Marker
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            title={spot.name}
            description={spot.category}
          />
        </MapView>

        <View style={s.header}>
          <View style={s.iconWrapper}>
            <Text style={s.iconText}>{categoryIcon(spot.category)}</Text>
          </View>
          <View style={s.titleText}>
            <Text style={s.name}>{spot.name}</Text>
            <View style={s.badgeRow}>
              <View style={s.badge}>
                <Text style={s.badgeText}>{spot.category}</Text>
              </View>
              {spot.fee === 'no' && (
                <View style={[s.badge, s.badgeFree]}>
                  <Text style={s.badgeText}>🆓 Gratuito</Text>
                </View>
              )}
              {spot.fee === 'yes' && (
                <View style={[s.badge, s.badgePaid]}>
                  <Text style={s.badgeText}>💰 Pago</Text>
                </View>
              )}
              {wc && (
                <View style={[s.badge, s.badgeWc]}>
                  <Text style={s.badgeText}>{wc}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {distance !== null && (
          <>
            <Text style={s.sectionTitle}>Como chegar</Text>
            <View style={s.card}>
              <View style={s.distanceRow}>
                <View style={s.distanceCard}>
                  <Ionicons name="navigate-outline" size={24} color={colors.gray500} />
                  <Text style={s.distanceValue}>{formatDistance(distance)}</Text>
                  <Text style={s.distanceLabel}>distância</Text>
                </View>
                <View style={s.distanceDivider} />
                <View style={s.distanceCard}>
                  <Ionicons name="walk-outline" size={24} color={colors.gray500} />
                  <Text style={s.distanceValue}>{formatWalk(distance)}</Text>
                  <Text style={s.distanceLabel}>a pé</Text>
                </View>
                <View style={s.distanceDivider} />
                <View style={s.distanceCard}>
                  <Ionicons name="car-outline" size={24} color={colors.gray500} />
                  <Text style={s.distanceValue}>{formatCar(distance)}</Text>
                  <Text style={s.distanceLabel}>de carro</Text>
                </View>
              </View>
              <TouchableOpacity style={s.mapsBtn} onPress={openMaps} activeOpacity={0.85}>
                <View style={s.mapsBtnContent}>
                  <Ionicons name="map-outline" size={20} color={colors.white} />
                  <Text style={s.mapsBtnText}>Abrir rota no Google Maps</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Text style={s.sectionTitle}>Informações</Text>
        <View style={s.card}>
          <InfoRow icon={<Ionicons name="location-outline" size={20} color={colors.gray400} />} label="Endereço" value={spot.address} />
          <InfoRow icon={<Ionicons name="globe-outline" size={20} color={colors.gray400} />} label="Website" value={spot.website || ''} onPress={spot.website ? openWebsite : undefined} />
          <InfoRow icon={<Ionicons name="call-outline" size={20} color={colors.gray400} />} label="Telefone" value={spot.phone || ''} onPress={spot.phone ? callPhone : undefined} />
          <InfoRow icon={<Ionicons name="earth-outline" size={20} color={colors.gray400} />} label="Wikipedia" value={spot.wikipedia || ''} onPress={spot.wikipedia ? openWikipedia : undefined} />
          <InfoRow icon={<Ionicons name="pin-outline" size={20} color={colors.gray400} />} label="Wikidata" value={spot.wikidata || ''} />
          <InfoRow icon={<Ionicons name="map-outline" size={20} color={colors.gray400} />} label="Coordenadas" value={`${spot.latitude.toFixed(5)}, ${spot.longitude.toFixed(5)}`} />
        </View>

        {hours.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Horários de funcionamento</Text>
            <View style={s.card}>
              {hours.map((h, i) => (
                <View key={i} style={[s.hourRow, i < hours.length - 1 && s.hourRowBorder]}>
                  <Text style={s.hourPeriod}>{h.period}</Text>
                  <Text style={s.hourValue}>{h.hours}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {spot.profiles?.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Indicado para</Text>
            <View style={s.profilesRow}>
              {spot.profiles.map((p, i) => (
                <View key={i} style={s.profileChip}>
                  <Text style={s.profileChipText}>👤 {p}</Text>
                </View>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}
