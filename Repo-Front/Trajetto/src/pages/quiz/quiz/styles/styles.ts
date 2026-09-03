import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },

    progressTrack: {
      height: 6,
      backgroundColor: colors.gray200,
      marginHorizontal: 20,
      borderRadius: 3,
      marginBottom: 8,
    },
    progressFill: {
      height: 6,
      backgroundColor: colors.primary,
      borderRadius: 3,
    },

    content: { padding: 24, paddingBottom: 16 },

    question: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: colors.text,
      lineHeight: 30,
      marginBottom: 32,
    },

    simNaoRow: { flexDirection: 'row', gap: 16 },
    simNaoButton: {
      flex: 1,
      padding: 20,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.gray200,
      alignItems: 'center',
    },
    simNaoSelected: { borderColor: colors.primary, backgroundColor: colors.primarySurface },
    simNaoText: { fontSize: 17, fontFamily: 'Inter-Medium', color: colors.gray600 },
    simNaoTextSelected: { color: colors.primary },
    naoSeiButton: {
      marginTop: 12,
      padding: 14,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.gray300,
      alignItems: 'center',
      backgroundColor: colors.gray50,
    },
    naoSeiText: { fontSize: 15, fontFamily: 'Inter-Medium', color: colors.gray400 },

    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.gray200,
      marginBottom: 12,
      gap: 14,
    },
    optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySurface },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.radioBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterSelected: { borderColor: colors.primary },
    radioInner: {
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: colors.primary,
    },
    optionText: { flex: 1, fontSize: 15, color: colors.textBody, lineHeight: 22 },
    optionTextSelected: { color: colors.primary, fontFamily: 'Inter-Medium' },

    footer: { padding: 24, paddingTop: 8 },
    nextButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    nextButtonDisabled: { backgroundColor: colors.primaryDisabled },
    nextButtonText: { color: colors.white, fontFamily: 'Inter-Bold', fontSize: 16 },
    headerWrapper: { paddingHorizontal: 24, backgroundColor: colors.primary, marginBottom: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', position: 'relative', height: 56 },
    headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    headerBackBtn: { paddingVertical: 4, paddingRight: 8, marginLeft: -12 },
    headerText: { fontSize: 18, fontFamily: 'Inter-Bold', color: colors.white },
  });
