import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    wrapper: { flex: 1, position: 'relative' },
    hint: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.hintSurface,
      borderRadius: 16,
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingRight: 22,
      gap: 4,
    },
    hintLabel: { fontSize: 12, fontFamily: 'Inter-Bold', color: colors.primary },
    cardWrapper: { flex: 1 },
  });
