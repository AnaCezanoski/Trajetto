import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.backgroundSoft },
    content: { padding: 24, paddingBottom: 40 },

    hero: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 32,
      alignItems: 'center',
      marginBottom: 20,
    },
    trophy: { fontSize: 32, marginBottom: 4 },
    heroLabel: { fontSize: 14, color: colors.onPrimarySubtle, marginBottom: 16 },
    emoji: { fontSize: 64, marginBottom: 12 },
    profileName: {
      fontSize: 26,
      fontFamily: 'Inter-Bold',
      color: colors.white,
      textAlign: 'center',
      letterSpacing: 1,
    },

    card: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 15,
      fontFamily: 'Inter-Bold',
      color: colors.primary,
      marginBottom: 12,
    },
    descricao: { fontSize: 15, color: colors.textFaint, lineHeight: 24 },

    destinoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    destinoDot: {
      width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary,
    },
    destinoText: { fontSize: 15, color: colors.textBody },

    backButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 4,
    },
    backButtonText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: 16 },

    errorText: { textAlign: 'center', marginTop: 40, fontSize: 16, color: colors.gray600 },
  });
