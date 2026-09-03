import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    ratingDropdown: {
      marginTop: 10, padding: 12, backgroundColor: colors.surfaceAlt,
      borderRadius: 12, borderWidth: 1, borderColor: colors.gray200, gap: 10,
    },
    ratingTitle: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.text },
    ratingInput: {
      borderWidth: 1, borderColor: colors.gray200, borderRadius: 10,
      padding: 10, fontSize: 13, minHeight: 60, textAlignVertical: 'top', backgroundColor: colors.white,
    },
    ratingButton: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    ratingButtonText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: 13 },
  });
