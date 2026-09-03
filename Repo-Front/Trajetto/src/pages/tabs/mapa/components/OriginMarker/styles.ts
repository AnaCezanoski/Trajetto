import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    originWrapper: { alignItems: 'center', gap: 4 },
    originDot: {
      width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary,
      borderWidth: 3, borderColor: colors.white,
      shadowColor: colors.shadow, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
    },
    originLabel: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
    originLabelText: { color: colors.white, fontSize: 10, fontFamily: 'Inter-Bold', letterSpacing: 0.5 },
  });
