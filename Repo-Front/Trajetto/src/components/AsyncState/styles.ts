import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    wrapper: { alignItems: 'center', justifyContent: 'center', gap: 12 },
    loadingText: { fontSize: 14, color: colors.gray500, textAlign: 'center' },
    errorIcon: { fontSize: 48 },
    errorText: { fontSize: 15, color: colors.gray700, textAlign: 'center' },
    retryBtn: { backgroundColor: colors.primaryDark, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
    retryText: { color: colors.white, fontFamily: 'Inter-Bold' },
    emptyIcon: { fontSize: 56 },
    emptyTitle: { fontSize: 18, fontFamily: 'Inter-Medium', color: colors.gray700, textAlign: 'center' },
    emptyDescription: { fontSize: 14, color: colors.gray400, textAlign: 'center', lineHeight: 20 },
  });
