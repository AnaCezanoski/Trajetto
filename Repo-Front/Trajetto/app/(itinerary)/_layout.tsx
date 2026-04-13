import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

const PRIMARY = '#023665';
const ACTIVE_TINT = '#ffffff';
const INACTIVE_TINT = 'rgba(255,255,255,0.45)';

function BackHeader() {
  const router = useRouter();
  return (
    <View style={headerStyles.container}>
      <TouchableOpacity
        style={headerStyles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={headerStyles.backIcon}>←</Text>
        <Text style={headerStyles.backLabel}>Roteiros</Text>
      </TouchableOpacity>
      <Text style={headerStyles.title}>Meu Roteiro</Text>
      <View style={{ width: 90 }} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingBottom: 12,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 4 },
  backIcon: { fontSize: 20, color: '#fff' },
  backLabel: { fontSize: 15, color: '#fff', fontWeight: '600' },
  title: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
});

export default function ItineraryLayout() {
  return (
    <>
      <BackHeader />
      <Tabs
        initialRouteName="itinerario"
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: ACTIVE_TINT,
          tabBarInactiveTintColor: INACTIVE_TINT,
          tabBarStyle: {
            backgroundColor: PRIMARY,
            borderTopWidth: 0,
            elevation: 12,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: -2 },
            height: Platform.OS === 'ios' ? 84 : 64,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            letterSpacing: 0.3,
          },
        }}>

        <Tabs.Screen
          name="itinerario"
          options={{
            title: 'Itinerário',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="list.bullet" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="mapa"
          options={{
            title: 'Mapa',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="map.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="person.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
