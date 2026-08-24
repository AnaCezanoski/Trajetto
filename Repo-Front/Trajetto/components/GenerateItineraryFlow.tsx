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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { PlaceSuggestion, searchAddresses } from '../services';
import { getErrorMessage } from '../utils/apiError';
import { Itinerary } from '../hooks/itineraryStore';
import { useItineraryStore } from '../hooks/itineraryStore';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#006ecf';
const STOP_COLORS = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C'];

type Step = 'config' | 'loading' | 'preview';

type Props = {
  visible: boolean;
  onAccept: (itinerary: Itinerary) => void;
  onClose: () => void;
};


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
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSuggestion | null>(null);
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
        const results = await searchAddresses(text.trim());
        setSuggestions(results);
        if (results.length > 0) {
          // Scroll to show suggestions above the keyboard
          scrollViewRef.current?.scrollTo({ y: Math.max(0, inputLayoutY.current - 20), animated: true });
        }
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const handleSelectSuggestion = (item: PlaceSuggestion) => {
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
    } catch (e) {
      setStep('config');
      Alert.alert('Erro', getErrorMessage(e, 'Não foi possível gerar o roteiro. Tente novamente.'));
    }
  };

  const handleRegenerate = async () => {
    if (!selectedPlace || !user) return;
    setStep('loading');
    try {
      const result = await runGenerate();
      setGeneratedItinerary(result);
      setStep('preview');
    } catch (e) {
      setStep('config');
      Alert.alert('Erro', getErrorMessage(e, 'Não foi possível gerar o roteiro. Tente novamente.'));
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
              nestedScrollEnabled
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

              {/* Wrapper com zIndex para garantir visibilidade no iOS */}
              <View style={{ zIndex: 10, elevation: 10 }}>
                {/* Campo com ícone de lupa e X */}
                <View
                  style={styles.autocompleteWrapper}
                  onLayout={e => { inputLayoutY.current = e.nativeEvent.layout.y; }}
                >
                  <CustomInput
                    value={addressInput}
                    onChangeText={handleInputChange}
                    placeholder="Ex: Via Veneto 45, Roma"
                    returnKeyType="search"
                    autoCorrect={false}
                    inputStyle={styles.addressInput}
                    style={{ marginBottom: 0 }}
                    inputWrapperStyle={[
                      { backgroundColor: '#fff' },
                      selectedPlace ? styles.inputRowSelected : null,
                      (suggestions.length > 0 && !selectedPlace) && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
                    ]}
                    leftIcon={<Ionicons name="search" size={20} color="#8a9ab0" style={styles.inputIcon} />}
                    rightElement={
                      searching ? (
                        <ActivityIndicator size="small" color={PRIMARY} />
                      ) : addressInput.length > 0 ? (
                        <TouchableOpacity onPress={handleClearInput} style={styles.clearBtn}>
                          <Text style={styles.clearBtnText}>✕</Text>
                        </TouchableOpacity>
                      ) : null
                    }
                  />
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
                        <Ionicons name="location" size={22} color="#8a9ab0"/>
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
              </View>

              {/* Endereço confirmado */}
              {selectedPlace && (
                <View style={styles.resolvedBox}>
                  <Ionicons name="checkmark-circle" size={20} color="#2e7d32" style={styles.resolvedIcon} />
                  <Text style={styles.resolvedText} numberOfLines={2}>
                    {selectedPlace.displayName.split(',').slice(0, 3).join(',')}
                  </Text>
                </View>
              )}

              <CustomButton
                title="Gerar Roteiro"
                onPress={handleGenerate}
                disabled={!selectedPlace}
                style={styles.generateBtn}
              />
            </ScrollView>
          )}

          {step === 'loading' && (
            <View style={styles.loadingContainer}>
              <OrbitLoader />
              <Text style={styles.loadingText}>Criando seu roteiro...</Text>
            </View>
          )}

          {step === 'preview' && generatedItinerary && (
            <ScrollView contentContainerStyle={styles.content}>

              {/* Resumo */}
              <View style={styles.summaryCard}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                  <Ionicons name="location" size={18} color="white" style={{marginBottom: 5}}/> 
                  <Text style={[styles.summaryTitle]}>
                  Roma, Itália
                  </Text>
                  </View>
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
                <TouchableOpacity style={styles.regenBtn} onPress={handleRegenerate} activeOpacity={0.7}>
                  <Ionicons name="reload" size={18} color="#4a5568" />
                  <Text style={styles.regenBtnText}>Re-gerar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept} activeOpacity={0.85}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.acceptBtnText}>Aceitar</Text>
                  </View>
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
  headerTitle: { fontSize: Platform.OS === 'ios' ? 14 : 22, fontWeight: 'bold', color: '#fff' },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 18, color: 'rgba(255,255,255,0.8)' },

  content: { padding: 24, paddingBottom: 80 },

  sectionLabel: {
    fontSize: Platform.OS === 'ios' ? 11 : 16,
    fontWeight: '700',
    color: '#8a9ab0',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 20,
  },
  hint: { fontSize: Platform.OS === 'ios' ? 13 : 18, color: '#8a9ab0', marginBottom: 10 },

  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#dde4ee',
  },
  chipActive: { borderColor: '#8a9ab0' },
  chipActiveText: { fontWeight: '700', fontSize: Platform.OS === 'ios' ? 12 : 18 },

  autocompleteWrapper: { marginBottom: 0 },
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
  inputIcon: { marginRight: 8 },
  addressInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: Platform.OS === 'ios' ? 16 : 18,
    color: '#1a1a1a',
  },
  clearBtn: { padding: 8 },
  clearBtnText: { fontSize: 14, color: '#aab', fontWeight: '600' },

  suggestionsBox: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#e2e8f0',
    marginTop: 0,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
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
  suggestionPrimary: { fontSize: Platform.OS === 'ios' ? 14 : 22, fontWeight: '600', color: '#1a1a1a', marginBottom: 2 },
  suggestionSecondary: { fontSize: Platform.OS === 'ios' ? 12 : 16, color: '#8a9ab0' },

  resolvedBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  resolvedIcon: { marginTop: -1 },
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
    width: '80%', alignSelf: 'center', height: 55,
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  regenBtnText: { fontSize: 15, fontWeight: '700', color: '#4a5568', marginLeft: 6 },
  acceptBtn: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    flexDirection: 'row'
  },
  acceptBtnText: { fontSize: 15, fontWeight: 'bold', color: '#fff', marginLeft: 6 },
});
