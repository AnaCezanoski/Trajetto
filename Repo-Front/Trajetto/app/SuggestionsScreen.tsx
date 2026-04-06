import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { api } from '../services/api';

interface Suggestion {
  id: number;
  cityName: string;
  country: string;
  description: string;
}

export default function SuggestionsScreen() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/itinerary/suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.log('Erro ao buscar sugestões', error);
      Alert.alert('Erro', 'Não foi possível carregar as sugestões.');
    } finally {
      setLoading(false);
    }
  };

  const removeSuggestion = (id: number) => {
    setSuggestions((prevSuggestions) => prevSuggestions.filter(item => item.id !== id));
  };

  // O que aparece atrás do card quando o usuário arrasta
  const renderRightActions = () => (
    <View style={styles.deleteAction}>
      <Text style={styles.deleteText}>Descartar</Text>
    </View>
  );

  const renderItem = ({ item }: { item: Suggestion }) => (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={(direction) => {
        if (direction === 'right') {
          removeSuggestion(item.id);
        }
      }}
    >
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9}
        onPress={() => router.push('/ItineraryScreen')}
      >
        <Text style={styles.cityName}>{item.cityName}, {item.country}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.clickHint}>Toque para gerar o roteiro</Text>
      </TouchableOpacity>
    </Swipeable>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#023665" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Sugestões para Você</Text>
        <Text style={styles.subtitle}>
          Arraste para a esquerda para descartar ou toque no destino desejado para gerar seu roteiro.
        </Text>
        
        {suggestions.length === 0 ? (
          <Text style={styles.emptyText}>Você descartou todas as opções!</Text>
        ) : (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const PRIMARY = '#023665';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: PRIMARY, marginTop: 40, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  listContainer: { paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cityName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  description: { fontSize: 14, color: '#555', marginBottom: 16 },
  clickHint: { fontSize: 12, color: PRIMARY, fontWeight: '600', textAlign: 'right' },
  deleteAction: {
    backgroundColor: '#ff5252',
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
    height: '90%', // Aproximadamente a altura do card
  },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
});