import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    exploreBanner: {
      height: 160,
      marginBottom: 16,
      borderRadius: 16,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    exploreBannerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.exploreOverlay,
    },
    exploreBannerContent: {
      padding: 20,
      gap: 6,
    },
    exploreBannerTag: {
      backgroundColor: colors.glassTag,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
      alignSelf: 'flex-start',
      marginBottom: 4,
    },
    exploreBannerTagText: {
      fontSize: 11,
      fontFamily: 'Inter-Bold',
      color: colors.white,
      letterSpacing: 0.5,
    },
    exploreBannerTitle: {
      fontSize: 22,
      fontFamily: 'Inter-Bold',
      color: colors.white,
      lineHeight: 28,
      letterSpacing: -0.3,
    },
    exploreBannerBtn: {
      marginTop: 6,
      backgroundColor: colors.primary,
      alignSelf: 'flex-start',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 7,
    },
    exploreBannerBtnText: {
      fontSize: 13,
      fontFamily: 'Inter-Bold',
      color: colors.white,
    },
  });
