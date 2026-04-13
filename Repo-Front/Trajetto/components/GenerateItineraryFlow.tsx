import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { Itinerary } from '../hooks/itineraryStore';
import { useItineraryStore } from '../hooks/itineraryStore';

const PRIMARY = '#023665';

type Step = 'config' | 'loading' | 'preview';

type Props = {
  visible: boolean;
  onAccept: (itinerary: Itinerary) => void;
  onClose: () => void;
};

// ── Nominatim geocoding ──────────────────────────────────────────────────────
async function geocodeAddress(query: string): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const encoded = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&countrycodes=it&limit=1&format=json`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } });
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
}

// ── Spinning ball animation ──────────────────────────────────────────────────
const RADIUS = 54;
const BALL_R = 9;
const SIZE = (RADIUS + BALL_R + 4) * 2;
const CENTER = SIZE / 2;

function OrbitLoader() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Ball position on the circle
  const AnimatedG = Animated.createAnimatedComponent(G);

  return (
    <View style={loaderStyles.container}>
      <Svg width={SIZE} height={SIZE}>
        {/* Track */}
        <Circle cx={CENTER} cy={CENTER} r={RADIUS} stroke="#dde4ee" strokeWidth={6} fill="none" />
        {/* Arc */}
        <Circle
          cx={CENTER} cy={CENTER} r={RADIUS}
          stroke={PRIMARY} strokeWidth={6} fill="none"
          strokeDasharray={`${RADIUS * Math.PI * 1.5} ${RADIUS * Math.PI * 0.5}`}
          strokeLinecap="round"
          rotation={-90} origin={`${CENTER},${CENTER}`}
        />
      </Svg>
      {/* Orbiting ball — driven by Animated rotation */}
      <Animated.View
        style={[
          loaderStyles.ball,
          {
            transform: [
              { translateX: -CENTER + BALL_R },
              { translateY: -CENTER + BALL_R },
              { rotate },
              { translateX: CENTER - BALL_R },
              { translateY: CENTER - BALL_R - RADIUS },
            ],
          },
        ]}
      />
    </View>
  );
}

const loaderStyles = StyleSheet.create({
  container: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  ball: {
    position: 'absolute',
    width: BALL_R * 2,
    height: BALL_R * 2,
    borderRadius: BALL_R,
    backgroundColor: PRIMARY,
    top: CENTER - BALL_R - RADIUS,
    left: CENTER - BALL_R,
    shadowColor: PRIMARY,
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
});

// ── Main component ───────────────────────────────────────────────────────────
export default function GenerateItineraryFlow({ visible, onAccept, onClose }: Props) {
  const { user } = useAuth();
  const { generateItinerary, acceptGeneratedItinerary } = useItineraryStore();

  const [step, setStep] = useState<Step>('config');
  const [addressInput, setAddressInput] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState<{ lat: number; lng: number; displayName: string } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);

  // Reset on open
  useEffect(() => {
    if (visible) {
      setStep('config');
      setAddressInput('');
      setResolvedAddress(null);
      setGeocodeError('');
      setGeneratedItinerary(null);
    }
  }, [visible]);

  const handleGeocode = async () => {
    if (!addressInput.trim()) return;
    setGeocoding(true);
    setGeocodeError('');
    setResolvedAddress(null);
    try {
      const result = await geocodeAddress(addressInput.trim());
      if (!result) {
        setGeocodeError('Endereço não encontrado. Tente ser mais específico.');
      } else {
        setResolvedAddress(result);
      }
    } catch {
      setGeocodeError('Erro ao buscar endereço. Verifique sua conexão.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleGenerate = async () => {
    if (!resolvedAddress || !user) return;
    setStep('loading');
    try {
      const result = await generateItinerary(user.id, resolvedAddress.lat, resolvedAddress.lng);
      setGeneratedItinerary(result);
      setStep('preview');
    } catch {
      setStep('config');
      Alert.alert('Erro', 'Não foi possível gerar o roteiro. Tente novamente.');
    }
  };

  const handleRegenerate = async () => {
    if (!resolvedAddress || !user) return;
    setStep('loading');
    try {
      const result = await generateItinerary(user.id, resolvedAddress.lat, resolvedAddress.lng);
      setGeneratedItinerary(result);
      setStep('preview');
    } catch {
      setStep('config');
      Alert.alert('Erro', 'Não foi possível gerar o roteiro. Tente novamente.');
    }
  };

  const handleAccept = () => {
    if (!generatedItinerary) return;
    acceptGeneratedItinerary(generatedItinerary);
    onAccept(generatedItinerary);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>

          {/* ── Header ── */}
          {step !== 'loading' && (
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {step === 'config' ? 'Configurar Roteiro' : 'Roteiro Gerado'}
              </Text>
              {step === 'config' && (
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* ══════════ STEP: CONFIG ══════════ */}
          {step === 'config' && (
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

              {/* Cidade */}
              <Text style={styles.sectionLabel}>CIDADE</Text>
              <View style={styles.chipRow}>
                <View style={[styles.chip, styles.chipActive]}>
                  <Text style={styles.chipActiveText}>🏛️  Roma, Itália</Text>
                </View>
              </View>

              {/* Duração */}
              <Text style={styles.sectionLabel}>DURAÇÃO</Text>
              <View style={styles.chipRow}>
                <View style={[styles.chip, styles.chipActive]}>
                  <Text style={styles.chipActiveText}>1 dia</Text>
                </View>
              </View>

              {/* Ponto de partida */}
              <Text style={styles.sectionLabel}>PONTO DE PARTIDA</Text>
              <Text style={styles.hint}>Digite seu hotel ou endereço em Roma</Text>

              <View style={styles.searchRow}>
                <TextInput
                  style={styles.addressInput}
                  placeholder="Ex: Via Veneto 45, Roma"
                  placeholderTextColor="#aab"
                  value={addressInput}
                  onChangeText={text => {
                    setAddressInput(text);
                    setResolvedAddress(null);
                    setGeocodeError('');
                  }}
                  onSubmitEditing={handleGeocode}
                  returnKeyType="search"
                />
                <TouchableOpacity style={styles.searchBtn} onPress={handleGeocode} disabled={geocoding}>
                  {geocoding
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.searchBtnText}>🔍</Text>
                  }
                </TouchableOpacity>
              </View>

              {geocodeError ? (
                <Text style={styles.errorText}>{geocodeError}</Text>
              ) : null}

              {resolvedAddress && (
                <View style={styles.resolvedBox}>
                  <Text style={styles.resolvedIcon}>📍</Text>
                  <Text style={styles.resolvedText} numberOfLines={3}>
                    {resolvedAddress.displayName}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.generateBtn, !resolvedAddress && styles.generateBtnDisabled]}
                onPress={handleGenerate}
                disabled={!resolvedAddress}
                activeOpacity={0.85}
              >
                <Text style={styles.generateBtnText}>Gerar Roteiro</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* ══════════ STEP: LOADING ══════════ */}
          {step === 'loading' && (
            <View style={styles.loadingContainer}>
              <OrbitLoader />
              <Text style={styles.loadingText}>Criando seu roteiro...</Text>
            </View>
          )}

          {/* ══════════ STEP: PREVIEW ══════════ */}
          {step === 'preview' && generatedItinerary && (
            <ScrollView contentContainerStyle={styles.content}>
              <Text style={styles.previewSubtitle}>
                {generatedItinerary.places.length} paradas · Roma, Itália
              </Text>

              {/* Preview dos primeiros 3 lugares */}
              <View style={styles.previewList}>
                {generatedItinerary.places.slice(0, 3).map((place, idx) => (
                  <View key={idx} style={styles.previewItem}>
                    <View style={[styles.previewIndex, { backgroundColor: idx === 0 ? PRIMARY : '#4a90d9' }]}>
                      <Text style={styles.previewIndexText}>{idx + 1}</Text>
                    </View>
                    <View style={styles.previewItemContent}>
                      <Text style={styles.previewPlaceName}>{place.name}</Text>
                      <Text style={styles.previewPlaceAddr} numberOfLines={1}>{place.address}</Text>
                    </View>
                  </View>
                ))}
                {generatedItinerary.places.length > 3 && (
                  <Text style={styles.moreText}>
                    + {generatedItinerary.places.length - 3} outros lugares
                  </Text>
                )}
              </View>

              {/* Ações */}
              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.regenBtn} onPress={handleRegenerate} activeOpacity={0.8}>
                  <Text style={styles.regenBtnText}>↺  Re-gerar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
                  <Text style={styles.acceptBtnText}>✓  Aceitar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: PRIMARY,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 18,
    paddingHorizontal: 24,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 18, color: 'rgba(255,255,255,0.8)' },

  content: { padding: 24, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8a9ab0',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 20,
  },
  hint: { fontSize: 13, color: '#8a9ab0', marginBottom: 10 },

  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#dde4ee',
    backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipActiveText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  addressInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1a1a1a',
  },
  searchBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  searchBtnText: { fontSize: 18 },

  errorText: { fontSize: 13, color: '#EF4444', marginBottom: 8 },

  resolvedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  resolvedIcon: { fontSize: 16, marginTop: 1 },
  resolvedText: { flex: 1, fontSize: 13, color: '#2e7d32', lineHeight: 18 },

  generateBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  generateBtnDisabled: { opacity: 0.45, shadowOpacity: 0 },
  generateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 },
  loadingText: { fontSize: 16, color: '#8a9ab0', fontWeight: '500' },

  // Preview
  previewSubtitle: { fontSize: 14, color: '#8a9ab0', marginBottom: 20, marginTop: 4 },
  previewList: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  previewIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIndexText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  previewItemContent: { flex: 1 },
  previewPlaceName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  previewPlaceAddr: { fontSize: 12, color: '#8a9ab0' },
  moreText: { textAlign: 'center', fontSize: 13, color: '#8a9ab0', paddingVertical: 10 },

  previewActions: { flexDirection: 'row', gap: 12 },
  regenBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#c0ccd8',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  regenBtnText: { fontSize: 15, fontWeight: '700', color: '#4a5568' },
  acceptBtn: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  acceptBtnText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
});
