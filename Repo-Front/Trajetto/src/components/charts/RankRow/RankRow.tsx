import React from 'react';
import { Text, View } from 'react-native';
import { chartColors, useColors } from '@/src/theme';
import { styles } from './styles';

type RankRowProps = {
  index: number;
  isLast: boolean;
  name: string;
  subtitle?: React.ReactNode;
  count: number | string;
  countLabel?: string;
};

export default function RankRow({ index, isLast, name, subtitle, count, countLabel }: RankRowProps) {
  const s = styles(useColors());
  return (
    <View style={[s.rankRow, !isLast && s.rankRowBorder]}>
      <View style={[s.rankBadge, { backgroundColor: chartColors[index % chartColors.length] }]}>
        <Text style={s.rankBadgeText}>{index + 1}</Text>
      </View>
      <View style={s.rankInfo}>
        <Text style={s.rankName} numberOfLines={1}>{name}</Text>
        {subtitle ? (typeof subtitle === 'string' ? <Text style={s.rankSubtitle} numberOfLines={1}>{subtitle}</Text> : subtitle) : null}
      </View>
      <View style={s.rankCountBox}>
        <Text style={s.rankCount}>{count}</Text>
        {countLabel ? <Text style={s.rankCountLabel}>{countLabel}</Text> : null}
      </View>
    </View>
  );
}
