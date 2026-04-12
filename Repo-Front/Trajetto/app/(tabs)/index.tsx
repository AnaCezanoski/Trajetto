import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useItineraryStore } from './../../hooks/itineraryStore';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { itinerary, fetchItinerary } = useItineraryStore();

  useEffect(() => {
    if (!user) return
    fetchItinerary(user.id)
  }, [user])

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstName}</Text>
          <Text style={styles.subtitle}>Ready to explore?</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/ProfileScreen')}>
          <Text style={styles.actionIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Card lista de usuários — só mostra se for admin */}
      {user?.isAdmin && (
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Registered Users</Text>
          <Text style={styles.heroText}>
            Manage registered users in Trajetto.
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push('/UserListScreen')}>
            <Text style={styles.heroButtonText}>View Users</Text>
          </TouchableOpacity>
        </View>
      )}



      {itinerary ? (

        <View style={styles.places}>
          {itinerary.places.map((place, index) => (
            <View key={index} style={styles.placeBubble}>
              <View style={styles.placeBubbleContent}>
                <View style={styles.placeBubbleHeader}>
                  <Text style={[styles.placeBubbleTime, styles.placeBubbleTextHeader]}>{formatTime(place.estimatedVisitTime)}</Text>
                  <Text style={styles.placeBubbleTextHeader}>{place.name}</Text>
                </View>
                <Text
                  style={styles.placeAddress}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >{place.address}</Text>
              </View>
              <Text style={styles.placeDistance}>0.2km</Text>
            </View>
          ))}
        </View>



      )
        : (
          <>
            {/* Card principal */}
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>Traveler Profile Test</Text>
              <Text style={styles.heroText}>
                Discover your traveler profile and create personalized itineraries.
              </Text>
              <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/TravelerTestScreen')}>
                <Text style={styles.heroButtonText}>Start Now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>Generate Travel Itinerary</Text>
              <Text style={styles.heroText}>
                Discover personalized destinations based on your traveler profile.
              </Text>
              <TouchableOpacity style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Start Now</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      {/* Card principal */}
      <View style={[styles.heroCard, {marginTop: 20}]}>
        <Text style={styles.exploreEmoji}>🧾</Text>
        <Text style={styles.heroTitle}>Traveler Profile Test</Text>
        <Text style={styles.heroText}>
          Discover your traveler profile and create personalized itineraries.
        </Text>
        <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/TravelerTestScreen')}>
          <Text style={styles.heroButtonText}>Start Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.exploreEmoji}>✈️</Text>
        <Text style={styles.heroTitle}>Generate Travel Itinerary</Text>
        <Text style={styles.heroText}>
          Discover personalized destinations based on your traveler profile.
        </Text>
        <TouchableOpacity style={styles.heroButton}>
          <Text style={styles.heroButtonText}>Start Now</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Card novo — Explorar Pontos Turísticos */}
      <View style={[styles.heroCard, styles.exploreCard]}>
        <Text style={styles.exploreEmoji}>🗺️</Text>
        <Text style={styles.heroTitle}>Explore Tourist Spots</Text>
        <Text style={styles.heroText}>
          Search for tourist attractions, museums, monuments and more in any city.
        </Text>
        <TouchableOpacity
          style={styles.heroButton}
          onPress={() => router.push('../ExploreScreen')}>
          <Text style={[styles.heroButtonText, styles.exploreButtonText]}>Explore Now</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 24, paddingTop: 60 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 2 },
  logout: { color: '#EF4444', fontWeight: 'bold' },
  heroCard: {
    backgroundColor: '#023665', borderRadius: 16,
    padding: 24, marginBottom: 32,
  },

  exploreCard: {
    backgroundColor: '#023665',
  },
  exploreEmoji: {
    fontSize: 32, marginBottom: 8,
  },
  exploreButtonText: {
    color: '#023665',
  },

  heroTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  heroText: { fontSize: 14, color: '#c7d2fe', marginBottom: 20, lineHeight: 20 },
  heroButton: {
    backgroundColor: '#fff', borderRadius: 8,
    padding: 12, alignItems: 'center',
  },
  heroButtonText: { color: '#023665', fontWeight: 'bold', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  quickActions: { flexDirection: 'row', gap: 12 },
  actionCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 20, alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: '#444' },
  banner: {
    width: 600, height: 300,
    resizeMode: 'contain', alignSelf: 'center',
  },

  places: {
    flexDirection: 'column',
    gap: 12,
  },
  placeBubble: {
    width: '100%',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    flex: 1,
    minWidth: 0,

  },
  placeAddress: {
    fontSize: 16,
    color: '#666',
    flexShrink: 1,
  },
  placeDistance: {
    marginLeft: 8,
    minWidth: 0,
  },
  placeBubbleHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  placeBubbleTextHeader: {
    fontSize: 18,
  },
  placeBubbleTime: {
    fontWeight: 'bold',
  },
  placeBubbleContent: {
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,

  }
});
