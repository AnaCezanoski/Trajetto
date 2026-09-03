import React from 'react';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme';
import { styles } from './styles';

type SwipeableCardProps = {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  disabled?: boolean;
};

export default function SwipeableCard({ children, onSwipeLeft, disabled = false }: SwipeableCardProps) {
  const colors = useColors();
  const s = styles(colors);
  const translateX = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .activeOffsetX([-15, 15])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      if (e.translationX < 0) translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -80) {
        translateX.value = withTiming(-130, { duration: 120 }, () => {
          translateX.value = withSpring(0);
          runOnJS(onSwipeLeft)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={s.wrapper}>
      {!disabled && (
        <View style={s.hint}>
          <Ionicons name="sync-outline" size={24} color={colors.primary} />
          <Text style={s.hintLabel}>Trocar</Text>
        </View>
      )}
      <GestureDetector gesture={pan}>
        <Animated.View style={[s.cardWrapper, cardStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
