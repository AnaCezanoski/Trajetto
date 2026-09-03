import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    routeBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceFaded92,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginTop: 6,
      alignSelf: 'flex-start',
      gap: 7,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    routeDot: { width: 8, height: 8, borderRadius: 4 },
    routeText: { fontSize: 12, color: colors.text, flexShrink: 1 },
    routeLabel: { fontSize: 11, color: colors.textSubtle, fontFamily: 'Inter-Medium' },
    routeNum: { fontSize: 12, fontFamily: 'Inter-Bold' },
    routeArrow: { fontSize: 11, color: colors.textSubtle },
  });
