import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    arrowMarker: {
      width: 22, height: 22, borderRadius: 11,
      backgroundColor: colors.surfaceFaded85,
      borderWidth: 1.5,
      alignItems: 'center', justifyContent: 'center',
    },
    arrowText: { fontSize: 9, fontFamily: 'Inter-Bold' },
  });
