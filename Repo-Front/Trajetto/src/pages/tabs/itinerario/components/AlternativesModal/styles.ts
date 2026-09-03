import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1, backgroundColor: colors.overlay45, justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8,
    },
    handle: {
      width: 40, height: 4, backgroundColor: colors.border,
      borderRadius: 2, alignSelf: 'center', marginBottom: 16,
    },
    title: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.gray900, marginBottom: 4 },
    subtitle: { fontSize: 13, color: colors.gray500, marginBottom: 20 },
    loading: { alignItems: 'center', paddingVertical: 32, gap: 12 },
    loadingText: { fontSize: 14, color: colors.gray500 },
    empty: { alignItems: 'center', paddingVertical: 32 },
    emptyText: { fontSize: 14, color: colors.gray400 },
    list: { gap: 10, marginBottom: 20 },
    card: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.surfaceAlt, borderRadius: 14,
      padding: 14, borderWidth: 1.5, borderColor: colors.border, gap: 12,
    },
    iconBox: {
      width: 48, height: 48, borderRadius: 12,
      backgroundColor: colors.primarySurface, alignItems: 'center', justifyContent: 'center',
    },
    iconText: { fontSize: 24 },
    info: { flex: 1 },
    name: { fontSize: 15, fontFamily: 'Inter-Bold', color: colors.gray900 },
    cat: { fontSize: 12, color: colors.primary, marginTop: 2, textTransform: 'capitalize', fontFamily: 'Inter-Medium' },
    addr: { fontSize: 11, color: colors.gray400, marginTop: 2 },
    freeBadge: { backgroundColor: colors.successSurface, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    freeBadgeText: { fontSize: 12 },
    paidBadge: { backgroundColor: colors.warningSurface, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
    paidBadgeText: { fontSize: 12 },
    cancelBtn: {
      borderWidth: 1.5, borderColor: colors.border, borderRadius: 12,
      paddingVertical: 14, alignItems: 'center',
    },
    cancelBtnText: { fontSize: 15, fontFamily: 'Inter-Medium', color: colors.gray500 },
  });
