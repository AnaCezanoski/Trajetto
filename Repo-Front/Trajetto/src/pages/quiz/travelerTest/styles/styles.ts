import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primary },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    icon: { fontSize: 72, marginBottom: 32 },
    title: {
      fontSize: 30,
      fontFamily: 'Inter-Bold',
      color: colors.white,
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      color: colors.onPrimarySubtle,
      textAlign: 'center',
      lineHeight: 26,
    },
    retakeBadge: {
      marginTop: 20,
      backgroundColor: colors.glassSurface,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    retakeBadgeText: { color: colors.white, fontSize: 13, fontFamily: 'Inter-Medium' },
    dots: { flexDirection: 'row', gap: 8, marginTop: 40 },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.dotInactive,
    },
    dotActive: { backgroundColor: colors.white, width: 24 },
    buttons: { paddingHorizontal: 32, paddingBottom: 48, gap: 12 },
    primaryButton: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    primaryButtonText: { color: colors.primaryDark, fontFamily: 'Inter-Bold', fontSize: 16 },
    secondaryButton: {
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.glassBorderStrong,
      minHeight: 52,
      justifyContent: 'center',
    },
    secondaryButtonText: { color: colors.white, fontSize: 16 },
  });
