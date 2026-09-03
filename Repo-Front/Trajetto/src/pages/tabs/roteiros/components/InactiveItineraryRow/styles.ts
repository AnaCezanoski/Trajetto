import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    inactiveCard: {
      backgroundColor: colors.white, borderRadius: 14,
      paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10,
      shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    cardSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.selectedSurface,
    },
    inactiveCardRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    inactiveCardInfo: { flex: 1 },
    inactiveCardTitleRow: { flexDirection: 'row' },
    inactiveCardTitle: { fontSize: 14, fontFamily: 'Inter-Bold', color: colors.text, marginBottom: 3 },
    inactiveCardMeta: { fontSize: 12, color: colors.textSubtle },
    activateBtn: {
      borderWidth: 1.5, borderColor: colors.primary, borderRadius: 10,
      paddingHorizontal: 14, paddingVertical: 7, minWidth: 60, alignItems: 'center',
      marginLeft: 15,
    },
    activateBtnText: { fontSize: 13, fontFamily: 'Inter-Bold', color: colors.primary },
    inactiveDeleteBtn: { padding: 6 },
  });
