import { StyleSheet } from 'react-native';
import { AppColors } from '@/src/theme';

export const styles = (colors: AppColors) =>
  StyleSheet.create({
    timelineRow: { flexDirection: 'row' },
    rail: { alignItems: 'center', width: 24, marginRight: 14 },
    dot: { width: 14, height: 14, borderRadius: 7, marginTop: 18 },
    dotPast: { backgroundColor: colors.timelineDotPast, opacity: 0.6 },
    line: { flex: 1, width: 2, backgroundColor: colors.timelineTrackLight, marginTop: 4 },
  });
