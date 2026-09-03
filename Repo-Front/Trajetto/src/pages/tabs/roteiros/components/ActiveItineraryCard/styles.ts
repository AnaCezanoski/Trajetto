import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    itineraryCard: {
      backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 12,
      shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 }, elevation: 5,
    },
    cardSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.selectedSurface,
    },
    checkboxRow: { marginBottom: 10 },

    itineraryCardHeader: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 12,
    },
    activeBadge: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.activeBadgeSurface, borderRadius: 20,
      paddingHorizontal: 10, paddingVertical: 4, gap: 6,
    },
    activeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.successStrong },
    activeBadgeText: { fontSize: 12, fontFamily: 'Inter-Bold', color: colors.successText },
    itineraryDates: { fontSize: 12, color: colors.textSubtle, fontFamily: 'Inter-Medium' },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: 5 },
    locationIcon: { marginBottom: 5 },
    itineraryCardTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.text, flex: 1 },
    chevron: { fontSize: 22, color: colors.borderMuted, marginLeft: 8 },
    itineraryCardSub: { fontSize: 13, color: colors.textSubtle, marginBottom: 20 },

    timeline: { gap: 0 },
    timelineItem: { flexDirection: 'row', minHeight: 56 },
    timelineLeft: { alignItems: 'center', width: 20, marginRight: 14 },
    timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
    timelineDotPast: { backgroundColor: colors.timelineDotPast, opacity: 0.5 },
    timelineDotFirst: { backgroundColor: colors.primary },
    timelineDotNext: { backgroundColor: colors.timelineDotFuture },
    timelineLine: { flex: 1, width: 2, backgroundColor: colors.timelineTrack, marginTop: 4 },
    timelineContent: { flex: 1, paddingBottom: 16 },
    timelineContentPast: { opacity: 0.5 },
    timelineTime: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.primary, marginBottom: 2 },
    timelineName: { fontSize: 15, fontFamily: 'Inter-Medium', color: colors.text, marginBottom: 2 },
    timelineAddress: { fontSize: 12, color: colors.textSubtle },
    divider: { height: 1, backgroundColor: colors.dividerSoft, marginVertical: 12 },

    deleteBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      borderWidth: 1.5, borderColor: colors.dangerBorder, borderRadius: 12,
      paddingVertical: 13, backgroundColor: colors.dangerSurface, minHeight: 48,
    },
    deleteBtnText: { fontSize: 15, fontFamily: 'Inter-Medium', color: colors.error },
  });
