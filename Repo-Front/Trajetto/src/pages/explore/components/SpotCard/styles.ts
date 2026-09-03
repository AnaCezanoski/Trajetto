import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.gray200,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: colors.primarySurface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    cardIconText: { fontSize: 22 },
    cardContent: { flex: 1 },
    cardName: { fontSize: 15, fontFamily: 'Inter-Medium', color: colors.gray900 },
    cardCategory: {
      fontSize: 12,
      color: colors.primary,
      marginTop: 2,
      fontFamily: 'Inter-Medium',
      textTransform: 'capitalize',
    },
    cardAddress: { fontSize: 11, color: colors.gray400, marginTop: 2 },
    cardArrow: { fontSize: 22, color: colors.gray300, marginLeft: 8 },
  });
