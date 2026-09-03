import React from 'react';
import { Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export default function OriginMarker({ latitude, longitude }: { latitude: number; longitude: number }) {
  const s = styles(useColors());
  return (
    <Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
      <View style={s.originWrapper}>
        <View style={s.originDot} />
        <View style={s.originLabel}><Text style={s.originLabelText}>Início</Text></View>
      </View>
    </Marker>
  );
}
