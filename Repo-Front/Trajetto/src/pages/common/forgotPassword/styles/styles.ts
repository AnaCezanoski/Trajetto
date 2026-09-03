import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    kav: { flex: 1, backgroundColor: colors.primary },
    container: { flexGrow: 1 },
    card: {
      flex: 1,
      backgroundColor: colors.white,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      padding: 32,
      gap: 20,
    },
    cardTitle: { fontSize: 22, fontFamily: 'Inter-Bold', color: colors.text, marginBottom: 4 },
    formBlock: { marginTop: 60 },
    cardSub: { fontSize: 14, color: colors.text, marginBottom: 24, lineHeight: 20 },
    registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 100 },
    registerLink: { fontSize: 14, color: colors.primary, fontFamily: 'Inter-Bold' },
    headerWrapper: { paddingHorizontal: 24, backgroundColor: colors.primary },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 70, marginBottom: 20, position: 'relative', height: 44 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { padding: 8, marginLeft: -12 },
    headerText: { fontSize: 10, fontFamily: 'Inter-Bold', color: colors.white, marginLeft: -4 },
    headerCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
    logoBadge: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, padding: 5 },
  });
