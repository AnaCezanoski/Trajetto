import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    spotCard: {
      position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: colors.white, borderRadius: 20, padding: 18,
      shadowColor: colors.shadow, shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: -3 }, elevation: 10,
    },
    spotCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    spotCardEmoji: { fontSize: 32 },
    spotCardInfo: { flex: 1 },
    spotCardName: { fontSize: 16, fontFamily: 'Inter-Bold', color: colors.gray900 },
    spotCardCategory: { fontSize: 12, color: colors.primary, marginTop: 2, fontFamily: 'Inter-Medium', textTransform: 'capitalize' },
    spotCardClose: { padding: 4 },
    spotCardCloseText: { fontSize: 16, color: colors.gray400, fontFamily: 'Inter-Bold' },
    spotCardMeta: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
    badge: { backgroundColor: colors.successSurface, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    badgePaid: { backgroundColor: colors.warningSurface },
    badgeText: { fontSize: 12, color: colors.gray700, fontFamily: 'Inter-Medium' },
    spotCardDetail: { fontSize: 13, color: colors.textSlate, marginBottom: 4 },

    distanceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 12, marginVertical: 10 },
    distanceCard: { flex: 1, alignItems: 'center', gap: 2 },
    distanceIcon: { fontSize: 20 },
    distanceValue: { fontSize: 14, fontFamily: 'Inter-Bold', color: colors.gray900 },
    distanceLabel: { fontSize: 11, color: colors.gray500 },
    distanceDivider: { width: 1, height: 36, backgroundColor: colors.gray200 },

    spotCardBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
    spotCardBtnText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: 14 },
  });
