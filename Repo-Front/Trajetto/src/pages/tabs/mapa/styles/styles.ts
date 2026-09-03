import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },

    searchWrapper: { position: 'absolute', top: 56, left: 16, right: 16, zIndex: 20 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, shadowColor: colors.shadow, shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6, gap: 8 },
    searchInput: { flex: 1, fontSize: 15, color: colors.gray900 },
    clearBtn: { padding: 4 },
    clearBtnText: { fontSize: 14, color: colors.gray400, fontFamily: 'Inter-Bold' },
    filterBtnWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    filterBtn: { padding: 6, borderRadius: 8, backgroundColor: colors.gray100 },
    filterBtnActive: { backgroundColor: colors.primarySurface },
    filterBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: colors.primary, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
    filterBadgeText: { color: colors.white, fontSize: 10, fontFamily: 'Inter-Bold' },
  });
