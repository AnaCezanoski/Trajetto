import { StyleSheet } from 'react-native';
import { AppColors, adminAccent } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundMuted },
    container: { padding: 16, paddingBottom: 40 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
    loadingText: { fontSize: 14, color: colors.gray500 },
    errorIcon: { fontSize: 48 },
    errorText: { fontSize: 15, color: colors.gray700, textAlign: 'center' },
    retryBtn: { backgroundColor: colors.primaryDark, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
    retryText: { color: colors.white, fontFamily: 'Inter-Bold' },

    header: { marginBottom: 20, paddingTop: 8 },
    headerTitle: { fontSize: 28, fontFamily: 'Inter-Bold', color: colors.gray900 },
    headerSub: { fontSize: 14, color: colors.gray500, marginTop: 2 },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },

    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    verifiedBarTrack: { flex: 1, height: 14, backgroundColor: colors.gray100, borderRadius: 7, overflow: 'hidden' },
    verifiedBarFill: { height: 14, backgroundColor: adminAccent.green, borderRadius: 7 },
    verifiedPct: { fontSize: 15, fontFamily: 'Inter-Bold', color: colors.gray900, width: 40, textAlign: 'right' },
    verifiedLegend: { flexDirection: 'row', justifyContent: 'space-between' },
    verifiedLegendText: { fontSize: 12, color: colors.gray500 },

    noItineraryBox: { alignItems: 'center', paddingVertical: 8 },
    noItineraryCount: { fontSize: 40, fontFamily: 'Inter-Bold', color: adminAccent.amber },
    noItineraryLabel: { fontSize: 14, color: colors.gray500, textAlign: 'center', marginTop: 4 },
    noItinerarySub: { fontSize: 12, color: colors.gray400, textAlign: 'center', marginTop: 2 },
  });
