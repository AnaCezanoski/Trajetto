import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    chipsRow: { marginTop: 6 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primarySurface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: colors.primary, marginRight: 6 },
    chipText: { fontSize: 12, color: colors.primary, fontFamily: 'Inter-Medium' },
    chipClose: { fontSize: 11, color: colors.primary, fontFamily: 'Inter-Bold' },
  });
