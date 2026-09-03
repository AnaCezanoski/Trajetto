import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray100,
      gap: 12,
    },
    infoIconContainer: { width: 28, alignItems: 'center', justifyContent: 'center' },
    infoIconText: { fontSize: 20 },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 11, color: colors.gray400, fontFamily: 'Inter-Medium', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
    infoValue: { fontSize: 14, color: colors.gray900, fontFamily: 'Inter-Medium' },
    infoLink: { color: colors.primary, textDecorationLine: 'underline' },
    infoArrow: { fontSize: 18, color: colors.gray300 },
  });
