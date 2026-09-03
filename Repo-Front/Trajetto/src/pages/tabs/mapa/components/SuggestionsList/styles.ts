import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    suggestions: { backgroundColor: colors.white, borderRadius: 14, marginTop: 6, shadowColor: colors.shadow, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6, overflow: 'hidden' },
    suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray100, gap: 10 },
    suggestionEmoji: { fontSize: 20 },
    suggestionText: { flex: 1 },
    suggestionName: { fontSize: 14, fontFamily: 'Inter-Medium', color: colors.gray900 },
    suggestionCategory: { fontSize: 12, color: colors.gray500, marginTop: 1, textTransform: 'capitalize' },
    suggestionArrow: { fontSize: 16, color: colors.gray400 },
  });
