import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { Itinerary } from '../hooks/itineraryStore';
import { useItineraryStore } from '../hooks/itineraryStore';

const PRIMARY = '#023665';
const STOP_COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C'];

type Step = 'config' | 'loading' | 'preview';

type Props = {
  visible: boolean;
  onAccept: (itinerary: Itinerary) => void;
  onClose: () => void;
};

// ── Nominatim autocomplete ───────────────────────────────────────────────────
type Suggestion = { lat: number; lng: number; displayName: string; shortName: string };

async function fetchSuggestions(query: string): Promise<Suggestion[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&countrycodes=it&limit=5&format=json&addressdetails=1`;
  
  const res = await fetch(url, { 
    headers: { 
      'Accept-Language': 'pt-BR,pt;q=0.9',
      'User-Agent': 'TrajettoApp/1.0 (admin@authserver.com.br)' 
    } 
  });
  
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  
  return data.map((item: any) => {
    const addr = item.address ?? {};
    const short =
      addr.road
        ? `${addr.road}${addr.house_number ? ' ' + addr.house_number : ''}${addr.suburb ? ', ' + addr.suburb : ''}`
        : item.display_name.split(',')[0];
    return {
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name,
      shortName: short,
    };
  });
}

// ── Orbit loader ─────────────────────────────────────────────────────────────
const RADIUS = 54;
const BALL_R = 9;
const SIZE = (RADIUS + BALL_R + 6) * 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function OrbitLoader() {
  // Two separate values: ball uses native driver, arc (SVG prop) cannot
  const ballRot = useRef(new Animated.Value(0)).current;
  const arcProg = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.timing(ballRot, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(arcProg, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const rotate = ballRot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  // Offset shrinks from full circumference (nothing drawn) → 0 (fully drawn)
  const dashOffset = arcProg.interpolate({ inputRange: [0, 1], outputRange: [CIRCUMFERENCE, 0] });

  return (
    <View style={loaderStyles.container}>
      {/* Arc draws itself as ball moves — starts at 12 o'clock, grows clockwise */}
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <AnimatedCircle
          cx={CENTER} cy={CENTER} r={RADIUS}
          stroke={PRIMARY} strokeWidth={3} fill="none"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation={-90} origin={`${CENTER},${CENTER}`}
        />
      </Svg>
      {/* Ball leads at the growing tip of the arc */}
      <Animated.View style={[loaderStyles.arm, { transform: [{ rotate }] }]}>
        <View style={loaderStyles.ball} />
      </Animated.View>
    </View>
  );
}

const loaderStyles = StyleSheet.create({
  container: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  arm: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
  },
  ball: {
    position: 'absolute',
    width: BALL_R * 2,
    height: BALL_R * 2,
    borderRadius: BALL_R,
    backgroundColor: PRIMARY,
    top: CENTER - BALL_R - RADIUS,
    left: CENTER - BALL_R,
    shadowColor: PRIMARY,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
});

// ── Main component ───────────────────────────────────────────────────────────
export default function GenerateItineraryFlow({ visible, onAccept, onClose }: Props) {
  const { user } = useAuth();
  const { generateItinerary, acceptGeneratedItinerary } = useItineraryStore();

  const [step, setStep] = useState<Step>('config');
  const [addressInput, setAddressInput] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Suggestion | null>(null);
  const [generatedItinerary, setGeneratedItinerary] = useState<Itinerary | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputLayoutY = useRef<number>(0);

  // Reset on open
  useEffect(() => {
    if (visible) {
      setStep('config');
      setAddressInput('');
      setSuggestions([]);
      setSelectedPlace(null);
      setGeneratedItinerary(null);
    }
  }, [visible]);

  const handleInputChange = (text: string) => {
    setAddressInput(text);
    setSelectedPlace(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await fetchSuggestions(text.trim());
        setSuggestions(results);
        if (results.length > 0) {
          // Scroll to show suggestions above the keyboard
          scrollViewRef.current?.scrollTo({ y: inputLayoutY.current, animated: true });
        }
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (item: Suggestion) => {
    Keyboard.dismiss();
    setSelectedPlace(item);
    setAddressInput(item.shortName);
    setSuggestions([]);
  };

  const handleClearInput = () => {
    setAddressInput('');
    setSuggestions([]);
    setSelectedPlace(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const runGenerate = async () => {
    const start = Date.now();
    const result = await generateItinerary(user!.id, selectedPlace!.lat, selectedPlace!.lng);
    const elapsed = Date.now() - start;
    const remaining = 2000 - elapsed;
    if (remaining > 0) await new Promise(r => setTimeout(r, remaining));
    return result;
  };

  const handleGenerate = async () => {
    if (!selectedPlace || !user) return;
    setStep('loading');
    try {
      const result = await runGenerate();
      setGeneratedItinerary(result);
      setStep('preview');
    } catch {
      setStep('config');
      Alert.alert('Erro', 'Não foi possível gerar o roteiro. Tente novamente.');
    }
  };

  const handleRegenerate = async () => {
    if (!selectedPlace || !user) return;
    setStep('loading');
    try {
      const result = await runGenerate();
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.container}>

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
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
            >

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

              {/* Campo com ícone de lupa e X */}
              <View
                style={styles.autocompleteWrapper}
                onLayout={e => { inputLayoutY.current = e.nativeEvent.layout.y; }}
              >
                <View style={[styles.inputRow, selectedPlace && styles.inputRowSelected]}>
                  <Text style={styles.inputIcon}>🔍</Text>
                  <TextInput
                    style={styles.addressInput}
                    placeholder="Ex: Via Veneto 45, Roma"
                    placeholderTextColor="#aab"
                    value={addressInput}
                    onChangeText={handleInputChange}
                    returnKeyType="search"
                    autoCorrect={false}
                  />
                  {searching
                    ? <ActivityIndicator size="small" color={PRIMARY} style={{ marginRight: 12 }} />
                    : addressInput.length > 0
                      ? (
                        <TouchableOpacity onPress={handleClearInput} style={styles.clearBtn}>
                          <Text style={styles.clearBtnText}>✕</Text>
                        </TouchableOpacity>
                      ) : null
                  }
                </View>
              </View>

              {/* Dropdown de sugestões */}
              {suggestions.length > 0 && !selectedPlace && (
                <View style={styles.suggestionsBox}>
                  {suggestions.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.suggestionItem, idx < suggestions.length - 1 && styles.suggestionDivider]}
                      onPress={() => handleSelectSuggestion(item)}
                    >
                      <Text style={styles.suggestionPin}>📍</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.suggestionPrimary} numberOfLines={1}>{item.shortName}</Text>
                        <Text style={styles.suggestionSecondary} numberOfLines={1}>
                          {item.displayName.split(',').slice(1, 3).join(',')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Endereço confirmado */}
              {selectedPlace && (
                <View style={styles.resolvedBox}>
                  <Text style={styles.resolvedIcon}>✅</Text>
                  <Text style={styles.resolvedText} numberOfLines={2}>
                    {selectedPlace.displayName.split(',').slice(0, 3).join(',')}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.generateBtn, !selectedPlace && styles.generateBtnDisabled]}
                onPress={handleGenerate}
                disabled={!selectedPlace}
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

              {/* Resumo */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>🗓  Roma, Itália</Text>
                <Text style={styles.summaryMeta}>
                  {generatedItinerary.places.length} paradas · {selectedPlace?.shortName ?? ''}
                </Text>
              </View>

              {/* Lista completa de lugares */}
              <View style={styles.previewList}>
                {generatedItinerary.places.map((place, idx) => {
                  const color = STOP_COLORS[idx % STOP_COLORS.length];
                  const isLast = idx === generatedItinerary.places.length - 1;
                  return (
                    <View key={idx}>
                      <View style={styles.previewItem}>
                        {/* Linha vertical da timeline */}
                        <View style={styles.timelineCol}>
                          <View style={[styles.previewIndex, { backgroundColor: color }]}>
                            <Text style={styles.previewIndexText}>{idx + 1}</Text>
                          </View>
                          {!isLast && <View style={[styles.timelineLine, { backgroundColor: color + '40' }]} />}
                        </View>
                        <View style={styles.previewItemContent}>
                          <View style={styles.previewItemRow}>
                            <Text style={styles.previewPlaceName} numberOfLines={2}>{place.name}</Text>
                            {place.estimatedVisitTime ? (
                              <View style={[styles.timeBadge, { backgroundColor: color + '18', borderColor: color + '50' }]}>
                                <Text style={[styles.timeBadgeText, { color }]}>
                                  {place.estimatedVisitTime.slice(0, 5)}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                          {place.address ? (
                            <Text style={styles.previewPlaceAddr} numberOfLines={1}>{place.address}</Text>
                          ) : null}
                        </View>
                      </View>
                    </View>
                  );
                })}
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

        </SafeAreaView>
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

  content: { padding: 24, paddingBottom: 80 },

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

  autocompleteWrapper: { marginBottom: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  inputRowSelected: { borderColor: '#43a047' },
  inputIcon: { fontSize: 16, marginRight: 8 },
  addressInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a1a1a',
  },
  clearBtn: { padding: 8 },
  clearBtnText: { fontSize: 14, color: '#aab', fontWeight: '600' },

  suggestionsBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  suggestionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  suggestionPin: { fontSize: 16 },
  suggestionPrimary: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  suggestionSecondary: { fontSize: 12, color: '#8a9ab0' },

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
  summaryCard: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  summaryMeta: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },

  previewList: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  previewItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    gap: 14,
  },
  timelineCol: {
    alignItems: 'center',
    width: 30,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 16,
  },
  previewIndex: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIndexText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  previewItemContent: { flex: 1, paddingBottom: 4 },
  previewItemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 3 },
  previewPlaceName: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1a1a1a', lineHeight: 20 },
  previewPlaceAddr: { fontSize: 12, color: '#8a9ab0' },
  timeBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  timeBadgeText: { fontSize: 11, fontWeight: '700' },

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
