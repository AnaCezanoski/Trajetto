import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Props = {
  value?: number;
  onChange?: (rating: number) => void;
  size?: number;
  color?: string;
  readonly?: boolean;
};

export default function StarRating({
  value = 0,
  onChange,
  size = 24,
  color = '#f5b301',
  readonly = false,
}: Props) {
  const [rating, setRating] = useState(value);

  useEffect(() => {
    setRating(value);
  }, [value]);

  const handlePress = (index: number) => {
    if (readonly) return;
    const newRating = index + 1;
    setRating(newRating);
    onChange?.(newRating);
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < rating;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(index)}
            activeOpacity={readonly ? 1 : 0.7}
          >
            <IconSymbol
              name={filled ? 'star.fill' : 'star'}
              size={size}
              color={filled ? color : '#cbd5e1'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
  },
});