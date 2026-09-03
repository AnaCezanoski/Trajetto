import { Platform, StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    wrapper: { paddingHorizontal: 24, flex: 1, flexDirection: 'column', justifyContent: 'center', gap: 50, backgroundColor: colors.white },
    copyBlock: { flexDirection: 'column', gap: 0, justifyContent: 'center' },
    emptyBody: {
      fontSize: Platform.OS === 'ios' ? 16 : 22,
      fontFamily: 'Inter',
      color: colors.text,
      marginBottom: 10,
      textAlign: 'center',
    },
    emptyBodyFirst: { marginTop: 70, lineHeight: Platform.OS === 'ios' ? 22 : 30 },
    emptyBodyTallLine: { lineHeight: Platform.OS === 'ios' ? 22 : 30 },
    copyRow: { marginTop: -10, flexDirection: 'row', gap: 7, justifyContent: 'center', alignItems: 'center' },
    emptyHighlight: {
      marginTop: -5,
      fontSize: Platform.OS === 'ios' ? 16 : 25,
      fontFamily: 'FugazOne',
      color: colors.primary,
      alignSelf: 'center',
      lineHeight: Platform.OS === 'ios' ? 22 : 30,
    },
    emptyState: {
      marginVertical: 50,
      alignItems: 'center',
      backgroundColor: colors.white,
      flex: 1,
      justifyContent: 'center',
      paddingLeft: 40,
    },
    cardsStack: {
      width: 320,
      height: 240,
      position: 'relative',
      marginLeft: 40,
    },
    buttonWrapper: { paddingHorizontal: 24, paddingBottom: 60 },
  });
