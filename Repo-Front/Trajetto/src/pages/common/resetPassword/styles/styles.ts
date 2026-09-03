import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: colors.backgroundMuted, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
    card: { backgroundColor: colors.white, borderRadius: 24, padding: 28, shadowColor: colors.shadow, shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
    cardTitle: { fontSize: 22, fontFamily: 'Inter-Bold', color: colors.text, marginBottom: 4 },
    cardSub: { fontSize: 14, color: colors.textSubtle, marginBottom: 24, lineHeight: 20 },
    strength: { marginTop: 0, marginBottom: 16 },
    loginBtn: { backgroundColor: colors.primaryDark, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, shadowColor: colors.primaryDark, shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
    loginBtnDisabled: { opacity: 0.6 },
    loginBtnText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: 16 },
    registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
    registerLink: { fontSize: 14, color: colors.primaryDark, fontFamily: 'Inter-Bold' },
  });