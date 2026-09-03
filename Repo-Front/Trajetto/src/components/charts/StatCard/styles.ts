import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    statCard: {
      backgroundColor: colors.white, borderRadius: 14, padding: 16, width: '47%',
      shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    statIcon: { fontSize: 24, marginBottom: 8 },
    statValue: { fontSize: 26, fontFamily: 'Inter-Bold', color: colors.gray900, marginBottom: 2 },
    statLabel: { fontSize: 12, color: colors.gray500, fontFamily: 'Inter-Medium' },
    statSub: { fontSize: 11, color: colors.gray400, marginTop: 4 },
  });
