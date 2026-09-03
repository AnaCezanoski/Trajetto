import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40 },
    modalHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
    modalTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.gray900 },
    modalClearAll: { fontSize: 14, color: colors.error, fontFamily: 'Inter-Medium' },
    scrollArea: { maxHeight: 440 },
    filterSection: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.gray700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    filterSubLabel: { fontSize: 12, color: colors.gray500, marginTop: -8, marginBottom: 8 },
    filterChipsRow: { marginBottom: 16 },

    filterChip: { borderWidth: 1, borderColor: colors.gray200, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: colors.white },
    filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterChipText: { fontSize: 13, color: colors.gray700, textTransform: 'capitalize' },
    filterChipTextActive: { color: colors.white, fontFamily: 'Inter-Medium' },

    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    filterOption: { borderWidth: 1, borderColor: colors.gray200, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.white },
    filterOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    filterOptionText: { fontSize: 13, color: colors.gray700 },
    filterOptionTextActive: { color: colors.white, fontFamily: 'Inter-Medium' },

    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },

    modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
    clearFilterBtn: { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: colors.gray200, paddingVertical: 14, alignItems: 'center' },
    clearFilterBtnText: { color: colors.gray500, fontFamily: 'Inter-Medium', fontSize: 15 },
    applyBtn: { flex: 2, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    applyBtnText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: 15 },
  });
