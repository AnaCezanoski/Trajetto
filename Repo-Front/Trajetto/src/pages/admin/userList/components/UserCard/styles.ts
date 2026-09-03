import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarCircle: {
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: colors.avatarSurface,
      alignItems: 'center', justifyContent: 'center',
      marginRight: 12,
    },
    avatarEmoji: { fontSize: 22 },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontFamily: 'Inter-Bold', color: colors.text, marginBottom: 2 },
    cardEmail: { fontSize: 13, color: colors.chipMutedText, marginBottom: 2 },
    cardMeta: { fontSize: 12, color: colors.gray400, marginBottom: 6 },
    roleBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.chipMuted,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    roleBadgeAdmin: { backgroundColor: colors.chipPrimarySurface },
    roleBadgeText: { fontSize: 11, fontFamily: 'Inter-Bold', color: colors.chipMutedText },
    roleBadgeTextAdmin: { color: colors.primaryDark },

    cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
    editBtn: {
      borderWidth: 1.5,
      borderColor: colors.primaryDark,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    editBtnText: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.primaryDark },
    deleteBtn: { padding: 6 },
    deleteBtnIcon: { fontSize: 18 },
  });
