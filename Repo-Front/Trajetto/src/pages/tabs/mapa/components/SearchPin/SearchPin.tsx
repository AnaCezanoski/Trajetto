import React from 'react';
import { Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Place } from '@/services';
import { categoryIcon } from '@/src/helpers/categoryIcon';
import { useColors } from '@/src/theme';
import { styles } from './styles';

export default function SearchPin({ spot }: { spot: Place }) {
  const s = styles(useColors());
  return (
    <Marker coordinate={{ latitude: spot.latitude, longitude: spot.longitude }} tracksViewChanges={false}>
      <View style={s.searchPinWrapper}>
        <View style={s.searchPin}>
          <Text style={s.searchPinIcon}>{categoryIcon(spot.category)}</Text>
        </View>
        <View style={s.searchPinTail} />
      </View>
    </Marker>
  );
}
