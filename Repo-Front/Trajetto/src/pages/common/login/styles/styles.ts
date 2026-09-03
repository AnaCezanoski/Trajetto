import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
      paddingBottom: 80,
      backgroundColor: colors.primary,
    },
    container: {
      flexGrow: 1,
      backgroundColor: colors.primary,
      paddingTop: 150,
    },
    intro: {
      fontSize: 12,
      color: colors.onPrimaryMuted,
      marginBottom: 5,
      marginLeft: 2,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    logoContainer: {
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 10,
      padding: 5,
    },
    brand: {
      fontSize: 30,
      fontFamily: 'FugazOne',
      color: colors.white,
    },
    card: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 28,
      paddingBottom: 40,
    },
    cardTitle: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      marginBottom: 15,
    },
    errorBox: {
      backgroundColor: colors.errorSurface,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    errorBoxText: {
      fontSize: 13,
      color: colors.errorText,
    },
    link: {
      fontSize: 14,
      color: colors.primary,
      textAlign: 'right',
      marginBottom: 30,
    },
    registerRow: {
      marginTop: 30,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    registerText: {
      fontSize: 14,
      color: colors.textSubtle,
    },
    registerLink: {
      fontSize: 14,
      color: colors.primary,
      fontFamily: 'Inter-Bold',
    },
  });
