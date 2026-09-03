import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    selectBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 14,
      borderTopWidth: 1, borderTopColor: colors.borderSubtle,
      shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 8,
      shadowOffset: { width: 0, height: -2 }, elevation: 8,
    },
    selectBarCount: { fontSize: 15, fontFamily: 'Inter-Medium', color: colors.textMuted },
    bulkDeleteBtn: {
      backgroundColor: colors.error, borderRadius: 12,
      paddingHorizontal: 20, paddingVertical: 12, minWidth: 140, alignItems: 'center',
    },
    bulkDeleteBtnDisabled: { backgroundColor: colors.dangerBorder },
    bulkDeleteBtnText: { fontSize: 14, fontFamily: 'Inter-Bold', color: colors.white },
  });
