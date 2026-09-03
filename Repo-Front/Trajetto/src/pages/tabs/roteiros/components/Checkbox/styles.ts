import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    checkbox: {
      width: 24, height: 24, borderRadius: 6,
      borderWidth: 2, borderColor: colors.borderMuted,
      backgroundColor: colors.white,
      alignItems: 'center', justifyContent: 'center',
    },
    checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    checkmark: { color: colors.white, fontSize: 14, fontFamily: 'Inter-Bold' },
  });
