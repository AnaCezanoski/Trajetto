import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

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

      <Image
        source={require('../../assets/images/home-banner.png')}
        style={styles.banner}
        resizeMode="contain"
      />

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
    width: 600,
    height: 300,
    resizeMode: 'contain',
    alignSelf: 'center'
  },
});
