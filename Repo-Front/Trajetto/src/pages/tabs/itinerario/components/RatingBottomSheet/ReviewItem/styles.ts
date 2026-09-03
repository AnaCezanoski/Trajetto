import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    reviewCard: {
      backgroundColor: colors.white, borderRadius: 12, padding: 12,
      borderWidth: 1, borderColor: colors.gray200, gap: 8, marginTop: 16,
    },
    reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    reviewAvatar: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    },
    reviewAvatarText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: 16 },
    reviewInfo: { flex: 1 },
    reviewName: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.text, marginBottom: 2 },
    reviewActions: { flexDirection: 'row', gap: 8 },
    reviewActionIcon: { fontSize: 16 },
    reviewComment: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  });
