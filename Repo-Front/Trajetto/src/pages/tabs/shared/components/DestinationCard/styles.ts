import { Platform, StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    card: {
      width: 160,
      height: 200,
      borderRadius: 20,
      padding: 14,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 10,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    cardTitle: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      color: colors.white,
      flex: 1,
    },
    timeBadge: {
      backgroundColor: colors.glassBorder,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: Platform.OS === 'ios' ? 2 : 3,
      marginLeft: 6,
      flexShrink: 1,
    },
    timeText: {
      fontSize: 11,
      fontFamily: 'Inter-Medium',
      color: colors.white,
    },
    cardSubtitle: {
      fontSize: 12,
      color: colors.onPrimaryFaint80,
      fontFamily: 'Inter-Medium',
      marginBottom: 10,
    },
    cardImage: {
      width: '100%',
      height: 110,
      borderRadius: 12,
      resizeMode: 'cover',
    },
  });
