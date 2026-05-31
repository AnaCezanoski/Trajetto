import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';

const PRIMARY = '#006ecf';
const ACTIVE_TINT = '#ffffff';
const INACTIVE_TINT = 'rgba(255,255,255,0.45)';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      initialRouteName="index"
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
          height: Platform.OS === 'ios' ? 84 : 80,
          paddingBottom: Platform.OS === 'ios' ? 24 : 16,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="calendar-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="map-outline" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="itinerario"
        options={{
          title: 'Trajetto',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="location-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
