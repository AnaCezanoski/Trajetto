import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    strengthRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2 },
    strengthOk: { backgroundColor: colors.success },
    strengthWeak: { backgroundColor: colors.trackMuted },
  });
