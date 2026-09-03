import { Dimensions, StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

const { width } = Dimensions.get('window');

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.gray50 },
    container: { paddingBottom: 40 },

    map: { width, height: 220 },

    header: { flexDirection: 'row', padding: 20, gap: 14, alignItems: 'flex-start' },
    iconWrapper: { width: 60, height: 60, borderRadius: 16, backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    iconText: { fontSize: 30 },
    titleText: { flex: 1 },
    name: { fontSize: 20, fontFamily: 'Inter-Bold', color: colors.gray900, marginBottom: 8, lineHeight: 26 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    badge: { backgroundColor: colors.primarySurface, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    badgeFree: { backgroundColor: colors.successSurface },
    badgePaid: { backgroundColor: colors.warningSurface },
    badgeWc: { backgroundColor: colors.infoSurface },
    badgeText: { fontSize: 12, color: colors.gray700, fontFamily: 'Inter-Medium' },

    sectionTitle: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.gray500,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginHorizontal: 16, marginBottom: 8, marginTop: 4,
    },

    card: {
      marginHorizontal: 16, marginBottom: 16,
      backgroundColor: colors.white, borderRadius: 16,
      borderWidth: 1, borderColor: colors.gray200,
      overflow: 'hidden',
    },

    distanceRow: { flexDirection: 'row', padding: 16 },
    distanceCard: { flex: 1, alignItems: 'center', gap: 4 },
    distanceValue: { fontSize: 15, fontFamily: 'Inter-Bold', color: colors.gray900 },
    distanceLabel: { fontSize: 11, color: colors.gray500 },
    distanceDivider: { width: 1, height: 48, backgroundColor: colors.gray100, alignSelf: 'center' },
    mapsBtn: {
      margin: 12, marginTop: 0,
      backgroundColor: colors.primary, borderRadius: 12,
      paddingVertical: 12, alignItems: 'center',
    },
    mapsBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    mapsBtnText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: 14 },

    hourRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
    hourRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray100 },
    hourPeriod: { fontSize: 13, color: colors.gray500, flex: 1 },
    hourValue: { fontSize: 13, color: colors.gray900, fontFamily: 'Inter-Medium' },

    profilesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginBottom: 16 },
    profileChip: { backgroundColor: colors.primarySurfaceAlt, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.primaryBorder },
    profileChipText: { fontSize: 13, color: colors.primary, fontFamily: 'Inter-Medium' },

    headerWrapper: { paddingHorizontal: 24, backgroundColor: colors.primary },
    headerRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', height: 56 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { paddingVertical: 4, paddingRight: 8, marginLeft: -12 },
    headerText: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.white },
  });
