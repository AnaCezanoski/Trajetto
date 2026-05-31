import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#006ecf';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
};

export default function PerfilTabContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuSections: { title?: string; items: MenuItem[] }[] = [
    {
      title: 'Conta',
      items: [
        {
          icon: 'settings-outline',
          label: 'Configurações',
          onPress: () => router.push('/ProfileScreen'),
        },
        {
          icon: 'notifications-outline',
          label: 'Notificações',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Viajante',
      items: [
        {
          icon: 'briefcase-outline',
          label: 'Refazer o teste de viajante',
          onPress: () => router.push('/TravelerTestScreen?source=profile'),
        },
        {
          icon: 'map-outline',
          label: 'Explorar destinos',
          onPress: () => router.push('/ExploreScreen'),
        },
      ],
    },
    {
      items: [
        {
          icon: 'log-out-outline',
          label: 'Sair',
          onPress: logout,
          danger: true,
        },
      ],
    },
  ];

  return (
    <View style={styles.safe}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrapper}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => router.back()} style={styles.headerBackBtn} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={32} color={'white'} />
              </TouchableOpacity>
              <Text style={styles.headerText}>Meus Roteiros</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroSection}>
          <View style={styles.avatarCircle}>
           <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.travelerProfile && user.travelerProfile !== 'SKIPPED' && (
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>🧳 {user.travelerProfile}</Text>
            </View>
          )}
        </View>

        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.section}>
            {section.title && (
              <Text style={styles.sectionTitle}>{section.title}</Text>
            )}
            <View style={styles.menuCard}>
              {section.items.map((item, iIdx) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={item.icon} 
                      size={22} 
                      color={item.danger ? '#EF4444' : '#4a5568'} 
                      style={styles.menuIcon} 
                    />
                    <Text style={[styles.menuLabel, item.danger && styles.dangerText]}>
                      {item.label}
                    </Text>
                    {!item.danger && <Text style={styles.menuArrow}>›</Text>}
                  </TouchableOpacity>
                  {iIdx < section.items.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        <Text style={styles.version}>Trajetto v1.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f4f6f9' },
  scrollView: { flex: 1 },
  content: { paddingBottom: 32 },

  heroSection: {
    backgroundColor: PRIMARY,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarEmoji: { fontSize: 48 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 12 },
  profileBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  profileBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  section: { paddingHorizontal: 20, marginBottom: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8a9ab0',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  menuIcon: { marginRight: 14, width: 28, textAlign: 'center' },
  menuLabel: { flex: 1, fontSize: 16, color: '#1a1a1a', fontWeight: '500' },
  menuArrow: { fontSize: 22, color: '#c0ccd8', fontWeight: '300' },
  dangerText: { color: '#EF4444' },
  separator: { height: 1, backgroundColor: '#f0f3f7', marginLeft: 60 },

  version: { textAlign: 'center', marginTop: 24, fontSize: 12, color: '#b0bec5' },
  headerWrapper: { paddingTop: 50, paddingHorizontal: 24, backgroundColor: PRIMARY },
  headerRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', height: 56 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
  headerBackBtn: { paddingVertical: 4, paddingRight: 8, marginLeft: -12 },
  headerText: { fontSize: 18, fontWeight: '700', color: 'white' },
  headerCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
});
