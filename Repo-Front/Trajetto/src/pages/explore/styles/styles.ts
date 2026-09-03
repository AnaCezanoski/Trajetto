import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.backgroundMuted },
    container: { flex: 1, paddingHorizontal: 16, backgroundColor: colors.backgroundMuted },

    header: { paddingTop: 24, paddingBottom: 8 },
    headerTitle: { fontSize: 28, fontFamily: 'Inter-Bold', color: colors.gray900 },
    headerSubtitle: { fontSize: 14, color: colors.gray500, marginTop: 2 },

    searchRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 8 },
    searchInput: { flex: 1, marginBottom: 0 },
    searchInputWrapper: { backgroundColor: colors.white },

    filterBtn: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.gray200,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBtnActive: { backgroundColor: colors.primarySurface, borderColor: colors.primary },
    filterBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.primary,
      borderRadius: 8,
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBadgeText: { color: colors.white, fontSize: 10, fontFamily: 'Inter-Bold' },

    activeFilterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
    activeFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primarySurface,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    activeFilterText: { fontSize: 13, color: colors.primary, fontFamily: 'Inter-Medium' },
    activeFilterClose: { fontSize: 13, color: colors.primary, fontFamily: 'Inter-Bold' },

    resultsLabel: { fontSize: 13, color: colors.gray500, marginBottom: 8 },

    loadingContainer: { alignItems: 'center', marginTop: 48, gap: 12 },
    loadingText: { fontSize: 14, color: colors.gray500 },

    list: { paddingBottom: 32 },
    listEmpty: { flex: 1 },

    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 48 },
    emptyIcon: { fontSize: 56, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontFamily: 'Inter-Medium', color: colors.gray700, marginBottom: 8, textAlign: 'center' },
    emptyText: { fontSize: 14, color: colors.gray400, textAlign: 'center', lineHeight: 20 },
    clearBtn: { marginTop: 16, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
    clearBtnText: { color: colors.white, fontFamily: 'Inter-Medium' },

    modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    modalSheet: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    modalHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
    modalTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.gray900, marginBottom: 16 },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray100,
    },
    categoryItemSelected: { backgroundColor: colors.primarySurfaceAlt, borderRadius: 8, paddingHorizontal: 8 },
    categoryItemText: { fontSize: 15, color: colors.gray700, textTransform: 'capitalize' },
    categoryItemTextSelected: { color: colors.primary, fontFamily: 'Inter-Bold' },
    checkmark: { color: colors.primary, fontSize: 16, fontFamily: 'Inter-Bold' },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    clearFilterBtn: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.gray200,
      paddingVertical: 14,
      alignItems: 'center',
    },
    clearFilterBtnText: { color: colors.gray500, fontFamily: 'Inter-Medium', fontSize: 15 },
    applyBtn: { flex: 2, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    applyBtnText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: 15 },

    headerWrapper: { paddingHorizontal: 24, backgroundColor: colors.primary },
    headerRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', height: 56 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { paddingVertical: 4, paddingRight: 8, marginLeft: -12 },
    headerText: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.white },
  });
