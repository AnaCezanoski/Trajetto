import React from 'react';
import { Text } from 'react-native';
import { styles } from './styles';

export default function StarRating({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.3 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <Text style={styles.stars}>
      {'★'.repeat(full)}{'½'.repeat(half)}{'☆'.repeat(empty)}
    </Text>
  );
}
