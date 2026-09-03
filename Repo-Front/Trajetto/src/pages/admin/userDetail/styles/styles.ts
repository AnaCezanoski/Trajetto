import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.backgroundMuted },
    content: { padding: 24, paddingBottom: 48 },

    avatarSection: { alignItems: 'center', marginBottom: 28 },
    avatarCircle: {
      width: 88, height: 88, borderRadius: 44,
      backgroundColor: colors.primaryDark,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 12,
      shadowColor: colors.primaryDark, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    avatarEmoji: { fontSize: 40 },
    avatarName: { fontSize: 20, fontFamily: 'Inter-Bold', color: colors.text, marginBottom: 2 },
    avatarEmail: { fontSize: 13, color: colors.chipMutedText },

    sectionTitle: {
      fontSize: 11, fontFamily: 'Inter-Bold', color: colors.chipMutedText,
      textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
    },
    card: {
      backgroundColor: colors.white, borderRadius: 20, padding: 20, marginBottom: 20,
      shadowColor: colors.shadow, shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3,
    },
    row: { flexDirection: 'row', gap: 12 },
    field: { flex: 1, marginBottom: 16 },
    fieldLabel: {
      fontSize: 12, fontFamily: 'Inter-Bold', color: colors.chipMutedText,
      marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
    },
    dropdownTrigger: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border,
      borderRadius: 10, paddingHorizontal: 13, paddingVertical: 11,
    },
    dropdownValue: { fontSize: 15, color: colors.text, flex: 1 },
    dropdownPlaceholder: { fontSize: 15, color: colors.gray400, flex: 1 },
    dropdownChevron: { fontSize: 10, color: colors.gray400, marginLeft: 8 },

    roleInfo: { fontSize: 14, color: colors.chipMutedText, marginBottom: 14 },
    roleValue: { color: colors.primaryDark, fontFamily: 'Inter-Bold' },
    roleRow: { flexDirection: 'row', gap: 12 },
    roleBtn: {
      flex: 1, paddingVertical: 12, borderRadius: 10,
      borderWidth: 1.5, borderColor: colors.border,
      alignItems: 'center', backgroundColor: colors.surfaceAlt,
    },
    roleBtnActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
    roleBtnText: { fontFamily: 'Inter-Bold', color: colors.chipMutedText, fontSize: 14 },
    roleBtnTextActive: { color: colors.white },

    saveButton: {
      backgroundColor: colors.primaryDark, borderRadius: 14, paddingVertical: 15,
      alignItems: 'center', shadowColor: colors.primaryDark, shadowOpacity: 0.3,
      shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5,
      minHeight: 50, justifyContent: 'center',
    },
    saveButtonText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: 16 },
  });
