import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../services/api';

interface Place {
  id: number;
  name: string;
  address: string;
}

interface Itinerary {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  places: Place[];
}

export default function ItineraryScreen() {
  const router = useRouter();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGenericItinerary();
  }, []);

  const fetchGenericItinerary = async () => {
    try {
      const response = await api.get('/itinerary/generic');
      setItinerary(response.data);
    } catch (error) {
      console.log('Erro ao buscar roteiro', error);
      Alert.alert('Erro', 'Não foi possível carregar o roteiro.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#023665" />
      </View>
    );
  }

  if (!itinerary) return null;

  return (
    <View style={styles.container}>
      <View style={styles.modalAlert}>
        <Text style={styles.modalTitle}>Seu roteiro está pronto!</Text>
        <Text style={styles.modalText}>
          Este é um roteiro sugerido. Fique à vontade para modificá-lo como quiser.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Roteiro</Text>
        <Text style={styles.title}>{itinerary.title}</Text>
        
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>Início: {itinerary.startDate}</Text>
          <Text style={styles.arrow}>→</Text>
          <Text style={styles.dateText}>Fim: {itinerary.endDate}</Text>
        </View>

        <Text style={styles.sectionTitle}>Destinos</Text>
        
        <View style={styles.cityCard}>
          <Text style={styles.cityName}>Paris</Text>
          
          {itinerary.places.map((place) => (
            <View key={place.id} style={styles.placeItem}>
              <View style={styles.placeDot} />
              <View>
                <Text style={styles.placeName}>{place.name}</Text>
                <Text style={styles.placeAddress}>{place.address}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Adicionar destino</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addCityButton}>
          <Text style={styles.addCityText}>+ Adicionar Cidade</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.mapButton} 
          onPress={() => router.push('/(tabs)/mapa')}
        >
          <Text style={styles.mapButtonText}>Ver Mapa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PRIMARY = '#023665';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalAlert: { backgroundColor: '#eef2ff', padding: 16, borderBottomWidth: 1, borderColor: '#c7d2fe' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: PRIMARY, marginBottom: 4 },
  modalText: { fontSize: 14, color: '#444' },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, color: '#666', textTransform: 'uppercase', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: 'bold', color: PRIMARY, marginBottom: 16 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  dateText: { fontSize: 15, fontWeight: '500', color: '#333' },
  arrow: { color: '#999' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 },
  
  cityCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cityName: { fontSize: 18, fontWeight: 'bold', color: PRIMARY, marginBottom: 16 },
  
  placeItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, gap: 12 },
  placeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: PRIMARY, marginTop: 6 },
  placeName: { fontSize: 16, fontWeight: '600', color: '#333' },
  placeAddress: { fontSize: 13, color: '#666', marginTop: 2 },
  
  addButton: { paddingVertical: 8 },
  addButtonText: { color: PRIMARY, fontWeight: '600', fontSize: 15 },
  
  addCityButton: { padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, borderStyle: 'dashed' },
  addCityText: { color: '#666', fontWeight: '600' },
  
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', flexDirection: 'row', gap: 12 },
  saveButton: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: PRIMARY, alignItems: 'center' },
  saveButtonText: { color: PRIMARY, fontWeight: 'bold', fontSize: 16 },
  mapButton: { flex: 1, backgroundColor: PRIMARY, padding: 16, borderRadius: 12, alignItems: 'center' },
  mapButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});