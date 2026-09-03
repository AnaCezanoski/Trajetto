import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    scrollView: { flex: 1, backgroundColor: colors.white },
    scrollContent: { flexGrow: 1 },
    headerWrapper: { paddingHorizontal: 24, paddingBottom: 40, backgroundColor: colors.primary },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 70, marginBottom: 20, position: 'relative', height: 44 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { padding: 8, marginLeft: -12 },
    headerText: { fontSize: 16, fontFamily: 'Inter-Bold', color: colors.white, marginLeft: -4 },
    headerCenter: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
    logoBadge: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 10, padding: 5 },
    card: {
      flex: 1,
      backgroundColor: colors.white,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      marginTop: -32,
      padding: 32,
    },
    title: { fontSize: 26, fontFamily: 'Inter-Bold', marginBottom: 10, color: colors.primary, textAlign: 'center' },
    subtitle: { fontSize: 15, color: colors.gray600, marginBottom: 36, textAlign: 'center', lineHeight: 22 },
    emailHighlight: { color: colors.gray800, fontFamily: 'Inter-Medium' },
  });
