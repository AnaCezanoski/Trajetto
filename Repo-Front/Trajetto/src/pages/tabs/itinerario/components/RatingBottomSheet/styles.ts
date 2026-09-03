import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    content: { flex: 1, margin: 16, gap: 5, paddingBottom: 30 },
    pressable: { flex: 1 },
    name: { fontSize: 22, fontFamily: 'Inter-Bold', color: colors.primary, marginBottom: 12 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
    rowNoMargin: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    textSecondary: { fontSize: 16, fontFamily: 'Inter-Bold', color: colors.text },
    textTertiary: { fontSize: 16, color: colors.textMuted },
    divider: { height: 1, backgroundColor: colors.gray200, marginVertical: 8 },
    summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    summaryToggle: { marginLeft: 'auto', color: colors.primary },
  });
