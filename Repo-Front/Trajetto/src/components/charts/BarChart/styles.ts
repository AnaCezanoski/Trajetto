import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    barChart: { gap: 10 },
    barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    barLabel: { fontSize: 12, color: colors.gray700, width: 72 },
    barTrack: { flex: 1, height: 10, backgroundColor: colors.gray100, borderRadius: 5, overflow: 'hidden' },
    barFill: { height: 10, borderRadius: 5 },
    barValue: { fontSize: 12, fontFamily: 'Inter-Bold', color: colors.gray900, width: 24, textAlign: 'right' },
  });
