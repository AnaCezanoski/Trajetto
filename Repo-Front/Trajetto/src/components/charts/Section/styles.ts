import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    section: { marginBottom: 16 },
    sectionTitle: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.gray500,
      textTransform: 'uppercase', letterSpacing: 0.8,
      marginBottom: 8, marginLeft: 2,
    },
    sectionCard: {
      backgroundColor: colors.white, borderRadius: 16, padding: 16,
      shadowColor: colors.shadow, shadowOpacity: 0.05, shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
  });
