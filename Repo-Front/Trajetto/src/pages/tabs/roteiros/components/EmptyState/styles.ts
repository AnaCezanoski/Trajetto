import { Platform, StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    wrapper: { flex: 1, flexDirection: 'column', gap: 50 },
    copyBlock: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
    copyRow: { marginTop: 20, flexDirection: 'row', gap: 7, alignItems: 'center' },
    copyRowTight: { marginTop: -10, flexDirection: 'row', gap: 7, alignItems: 'center' },
    emptyBody: {
      fontSize: Platform.OS === 'ios' ? 16 : 22,
      fontFamily: 'Inter',
      color: colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    emptyBodyTallLine: {
      lineHeight: Platform.OS === 'ios' ? 22 : 30,
    },
    emptyBodyTallerLine: {
      lineHeight: Platform.OS === 'ios' ? 24 : 30,
    },
    emptyBodyLast: {
      marginTop: -10,
      lineHeight: Platform.OS === 'ios' ? 24 : 30,
    },
    emptyHighlight: {
      marginTop: -7,
      fontSize: Platform.OS === 'ios' ? 18 : 25,
      fontFamily: 'FugazOne',
      color: colors.primary,
      alignSelf: 'center',
      lineHeight: Platform.OS === 'ios' ? 22 : 30,
    },
    emptyState: {
      alignItems: 'center',
      backgroundColor: colors.white,
      flex: 1,
      justifyContent: 'center',
      paddingLeft: 40,
    },
    cardsStack: {
      width: 320,
      height: 240,
      marginBottom: 32,
      position: 'relative',
    },
  });
