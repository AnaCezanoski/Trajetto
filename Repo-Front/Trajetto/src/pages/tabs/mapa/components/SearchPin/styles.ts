import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    searchPinWrapper: { alignItems: 'center' },
    searchPin: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, borderWidth: 2.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.shadow, shadowOpacity: 0.2, shadowRadius: 6, elevation: 6 },
    searchPinIcon: { fontSize: 22 },
    searchPinTail: { width: 3, height: 10, backgroundColor: colors.primary, borderRadius: 2 },
  });
