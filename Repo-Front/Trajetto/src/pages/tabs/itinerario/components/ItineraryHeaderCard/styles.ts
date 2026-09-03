import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    headerCard: {
      backgroundColor: colors.primary, borderRadius: 20, padding: 24, marginBottom: 24,
    },
    headerLabel: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.onPrimaryFaint55,
      letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4,
    },
    headerDates: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.white, marginBottom: 20 },
    statsRow: { flexDirection: 'row', alignItems: 'center' },
    stat: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 22, fontFamily: 'Inter-Bold', color: colors.white, marginBottom: 2 },
    statLabel: { fontSize: 12, color: colors.onPrimaryFaint60 },
    statDivider: { width: 1, height: 32, backgroundColor: colors.onPrimaryFaint20 },
    activeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.activeDotGreen, marginBottom: 4 },
  });
