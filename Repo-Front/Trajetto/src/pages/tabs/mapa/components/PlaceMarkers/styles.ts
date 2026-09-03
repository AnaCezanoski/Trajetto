import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    markerWrapper: { alignItems: 'center' },
    pulse: {
      position: 'absolute',
      width: 48, height: 48, borderRadius: 24,
      borderWidth: 2.5,
      bottom: 32, alignSelf: 'center',
      zIndex: -1,
    },
    label: {
      borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 4,
      shadowColor: colors.shadow, shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4,
      maxWidth: 160,
    },
    labelPast: { borderColor: colors.pinBorderPast, backgroundColor: colors.pinBgPast, opacity: 0.6 },
    labelText: { fontSize: 12, fontFamily: 'Inter-Bold', textAlign: 'center' },
    labelSub: { fontSize: 10, fontFamily: 'Inter-Medium', textAlign: 'center', opacity: 0.8, marginTop: 1 },
    pinContainer: { alignItems: 'center', justifyContent: 'center', width: 42, height: 42 },
    pinContainerPast: { opacity: 0.45 },
    numberBadge: {
      position: 'absolute', top: 5, width: 17, height: 17, borderRadius: 9,
      alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.white,
    },
    numberText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: 10 },
  });
