import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.primary },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingTop: 16,
      paddingBottom: 20,
      paddingHorizontal: 24,
    },
    headerTitleIos: { fontSize: 16, fontFamily: 'Inter-Bold', color: colors.white },
    headerTitleAndroid: { fontSize: 24, fontFamily: 'Inter-Bold', color: colors.white },
    headerSubIos: { fontSize: 13, color: colors.onPrimaryHeaderSub, marginTop: 2 },
    headerSubAndroid: { fontSize: 18, color: colors.onPrimaryHeaderSub, marginTop: 2 },
    cancelSelectText: { fontSize: 15, color: colors.white, fontFamily: 'Inter-Medium' },
    selectAllText: { fontSize: 15, color: colors.white, fontFamily: 'Inter-Medium' },
    avatarBtn: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: colors.glassSurface,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.glassBorder,
    },

    content: { padding: 20, paddingBottom: 32, backgroundColor: colors.white },

    centerState: { alignItems: 'center', paddingTop: 60, flex: 1, marginVertical: 100 },
    stateText: { marginTop: 16, fontSize: 15, color: colors.textMutedLight },

    sectionLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.textSubtle,
      letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase',
    },
    sectionLabelSpaced: { marginTop: 8 },

    generateSection: { marginTop: 8 },
    generateSectionEmpty: { backgroundColor: colors.white, flex: 1 },
    generateLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.textSubtle,
      letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase',
    },
  });
