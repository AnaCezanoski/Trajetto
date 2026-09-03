import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
    rankRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
    rankBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    rankBadgeText: { color: colors.white, fontSize: 13, fontFamily: 'Inter-Bold' },
    rankInfo: { flex: 1 },
    rankName: { fontSize: 14, fontFamily: 'Inter-Medium', color: colors.gray900 },
    rankSubtitle: { fontSize: 12, color: colors.gray400, marginTop: 1 },
    rankCountBox: { alignItems: 'center' },
    rankCount: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.primaryDark },
    rankCountLabel: { fontSize: 10, color: colors.gray400 },
  });
