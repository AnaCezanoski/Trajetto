import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.primaryDark },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 20,
      paddingHorizontal: 24,
      backgroundColor: colors.primaryDark,
    },
    headerTitle: { fontSize: 24, fontFamily: 'Inter-Bold', color: colors.white },
    headerSub: { fontSize: 13, color: colors.onPrimaryFaint, marginTop: 2 },
    logoutBtn: {
      borderWidth: 1.5,
      borderColor: colors.glassBorderStrong,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    logoutText: { color: colors.white, fontFamily: 'Inter-Medium', fontSize: 14 },

    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.backgroundMuted },
    loadingText: { marginTop: 12, fontSize: 15, color: colors.gray400 },

    list: { padding: 20, paddingBottom: 32, backgroundColor: colors.backgroundMuted, flexGrow: 1 },

    sectionLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.textSubtle,
      letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
    },
  });
