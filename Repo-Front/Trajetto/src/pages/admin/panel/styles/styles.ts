import { StyleSheet } from 'react-native';
import { AppColors, adminAccent } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundMuted },

    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: colors.primaryDark, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20,
    },
    headerTitle: { fontSize: 22, fontFamily: 'Inter-Bold', color: colors.white },
    headerSub: { fontSize: 13, color: colors.onPrimaryFaint70, marginTop: 2 },
    logoutBtn: { backgroundColor: colors.glassSurface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    logoutText: { color: colors.white, fontFamily: 'Inter-Medium', fontSize: 14 },

    quickActions: {
      flexDirection: 'row', gap: 10, paddingHorizontal: 16,
      paddingVertical: 16, backgroundColor: colors.primaryDark,
      borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    },
    quickCard: {
      flex: 1, backgroundColor: adminAccent.blue, borderRadius: 16,
      padding: 14, alignItems: 'center', gap: 4,
    },
    quickCardViolet: { backgroundColor: adminAccent.violet },
    quickCardGreen: { backgroundColor: adminAccent.green },
    quickLabel: { fontSize: 11, color: colors.onPrimaryFaint80, fontFamily: 'Inter-Medium', textTransform: 'uppercase', letterSpacing: 0.4 },
    quickCount: { fontSize: 20, fontFamily: 'Inter-Bold', color: colors.white },

    tabBar: {
      flexDirection: 'row', backgroundColor: colors.white,
      marginHorizontal: 16, marginTop: 16, borderRadius: 14,
      padding: 4, gap: 4,
      shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    tabBtn: {
      flex: 1, paddingVertical: 10, borderRadius: 10,
      alignItems: 'center', justifyContent: 'center',
    },
    tabBtnActive: { backgroundColor: colors.primaryDark },
    tabText: { fontSize: 13, fontFamily: 'Inter-Medium', color: colors.gray500 },
    tabTextActive: { color: colors.white },

    container: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
    loadingText: { fontSize: 14, color: colors.gray500 },
    errorIcon: { fontSize: 48 },
    errorText: { fontSize: 15, color: colors.gray700, textAlign: 'center' },
    retryBtn: { backgroundColor: colors.primaryDark, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
    retryText: { color: colors.white, fontFamily: 'Inter-Bold' },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8, marginTop: 16 },

    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    verifiedBarTrack: { flex: 1, height: 14, backgroundColor: colors.gray100, borderRadius: 7, overflow: 'hidden' },
    verifiedBarFill: { height: 14, backgroundColor: adminAccent.green, borderRadius: 7 },
    verifiedPct: { fontSize: 15, fontFamily: 'Inter-Bold', color: colors.gray900, width: 40, textAlign: 'right' },
    verifiedLegend: { flexDirection: 'row', justifyContent: 'space-between' },
    verifiedLegendText: { fontSize: 12, color: colors.gray500 },

    userListBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      backgroundColor: colors.white, borderRadius: 16, padding: 18,
      shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 }, elevation: 2, marginBottom: 8,
    },
    userListBtnIcon: { fontSize: 24 },
    userListBtnText: { flex: 1, fontSize: 15, fontFamily: 'Inter-Medium', color: colors.gray900 },
    userListBtnArrow: { fontSize: 22, color: colors.gray300 },

    emptyBox: { alignItems: 'center', paddingVertical: 40, gap: 12 },
    emptyIcon: { fontSize: 48 },
    emptyText: { fontSize: 16, fontFamily: 'Inter-Medium', color: colors.gray700, textAlign: 'center' },
    emptySubText: { fontSize: 13, color: colors.gray400, textAlign: 'center', lineHeight: 20 },
  });
