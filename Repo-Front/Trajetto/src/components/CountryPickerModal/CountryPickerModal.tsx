import React from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { countries } from '@/utils/countries';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type CountryPickerModalProps = {
  visible: boolean;
  selected: string;
  onSelect: (country: string) => void;
  onClose: () => void;
};

export default function CountryPickerModal({ visible, selected, onSelect, onClose }: CountryPickerModalProps) {
  const s = styles(useColors());

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>Selecione o país</Text>
          <FlatList
            data={countries}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={s.modalItem} onPress={() => onSelect(item)}>
                <Text style={[s.modalItemText, selected === item && s.modalItemSelected]}>
                  {item}
                </Text>
                {selected === item && <Text style={s.checkmark}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
