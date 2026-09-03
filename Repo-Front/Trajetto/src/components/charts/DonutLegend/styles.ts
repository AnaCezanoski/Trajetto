import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    donutLegend: { gap: 10 },
    donutRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    donutDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
    donutLabel: { fontSize: 13, color: colors.gray700, width: 90 },
    donutBarTrack: { flex: 1, height: 8, backgroundColor: colors.gray100, borderRadius: 4, overflow: 'hidden' },
    donutBarFill: { height: 8, borderRadius: 4 },
    donutPct: { fontSize: 12, fontFamily: 'Inter-Bold', color: colors.gray900, width: 32, textAlign: 'right' },
  });
