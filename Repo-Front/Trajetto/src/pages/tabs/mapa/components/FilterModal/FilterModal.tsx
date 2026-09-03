import React from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View, Modal } from 'react-native';
import { categoryIcon } from '@/src/helpers/categoryIcon';
import { useColors } from '@/src/theme';
import { DISTANCE_OPTIONS } from '../../data/distanceOptions';
import { styles } from './styles';

type FilterModalProps = {
  visible: boolean;
  categories: string[];
  profiles: string[];
  activeCount: number;
  tempCategory: string;
  setTempCategory: (v: string) => void;
  tempFee: 'yes' | 'no' | '';
  setTempFee: (v: 'yes' | 'no' | '') => void;
  tempHasHours: boolean;
  setTempHasHours: (v: boolean) => void;
  tempProfile: string;
  setTempProfile: (v: string) => void;
  tempMaxDistance: number | undefined;
  setTempMaxDistance: (v: number | undefined) => void;
  onApply: () => void;
  onClearAll: () => void;
  onClose: () => void;
};

const FEE_OPTIONS: { label: string; value: 'yes' | 'no' | '' }[] = [
  { label: 'Qualquer', value: '' },
  { label: '🆓 Gratuito', value: 'no' },
  { label: '💰 Pago', value: 'yes' },
];

export default function FilterModal({
  visible, categories, profiles, activeCount,
  tempCategory, setTempCategory,
  tempFee, setTempFee,
  tempHasHours, setTempHasHours,
  tempProfile, setTempProfile,
  tempMaxDistance, setTempMaxDistance,
  onApply, onClearAll, onClose,
}: FilterModalProps) {
  const colors = useColors();
  const s = styles(colors);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <View style={s.modalTitleRow}>
            <Text style={s.modalTitle}>Filtros</Text>
            {activeCount > 0 && (
              <TouchableOpacity onPress={onClearAll}>
                <Text style={s.modalClearAll}>Limpar tudo</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={s.scrollArea}>

            <Text style={s.filterSection}>Categoria</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterChipsRow}>
              {['', ...categories].map((cat) => (
                <TouchableOpacity
                  key={cat || 'all'}
                  style={[s.filterChip, tempCategory === cat && s.filterChipActive]}
                  onPress={() => setTempCategory(cat)}
                >
                  <Text style={[s.filterChipText, tempCategory === cat && s.filterChipTextActive]}>
                    {cat ? `${categoryIcon(cat)} ${cat}` : '📍 Todas'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.filterSection}>Entrada</Text>
            <View style={s.filterRow}>
              {FEE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.filterOption, tempFee === opt.value && s.filterOptionActive]}
                  onPress={() => setTempFee(opt.value)}
                >
                  <Text style={[s.filterOptionText, tempFee === opt.value && s.filterOptionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={s.switchRow}>
              <View>
                <Text style={s.filterSection}>Apenas com horário definido</Text>
                <Text style={s.filterSubLabel}>Exclui locais sem informação de horário</Text>
              </View>
              <Switch
                value={tempHasHours}
                onValueChange={setTempHasHours}
                trackColor={{ false: colors.gray300, true: colors.primary }}
                ios_backgroundColor={colors.gray300}
                thumbColor={colors.white}
              />
            </View>

            <Text style={s.filterSection}>Perfil de viajante</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterChipsRow}>
              {['', ...profiles].map((p) => (
                <TouchableOpacity
                  key={p || 'all'}
                  style={[s.filterChip, tempProfile === p && s.filterChipActive]}
                  onPress={() => setTempProfile(p)}
                >
                  <Text style={[s.filterChipText, tempProfile === p && s.filterChipTextActive]}>
                    {p || '👤 Todos'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.filterSection}>Distância máxima da sua localização</Text>
            <View style={s.filterRow}>
              {DISTANCE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={[s.filterOption, tempMaxDistance === opt.value && s.filterOptionActive]}
                  onPress={() => setTempMaxDistance(opt.value)}
                >
                  <Text style={[s.filterOptionText, tempMaxDistance === opt.value && s.filterOptionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>

          <View style={s.modalActions}>
            <TouchableOpacity style={s.clearFilterBtn} onPress={onClose}>
              <Text style={s.clearFilterBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.applyBtn} onPress={onApply}>
              <Text style={s.applyBtnText}>Aplicar filtros</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
