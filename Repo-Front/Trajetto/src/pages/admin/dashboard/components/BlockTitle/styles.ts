import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    blockTitle: {
      fontSize: 18, fontFamily: 'Inter-Bold', color: colors.gray900,
      marginTop: 12, marginBottom: 10, marginLeft: 2,
    },
  });
