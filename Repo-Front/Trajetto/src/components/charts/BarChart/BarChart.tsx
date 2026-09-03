import React from 'react';
import { Text, View } from 'react-native';
import { chartColors, useColors } from '@/src/theme';
import { styles } from './styles';

type BarChartProps<T extends Record<string, any>> = {
  data: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  limit?: number;
};

export default function BarChart<T extends Record<string, any>>({ data, labelKey, valueKey, limit = 8 }: BarChartProps<T>) {
  const s = styles(useColors());
  const max = Math.max(...data.map((d) => d[valueKey]), 1);

  return (
    <View style={s.barChart}>
      {data.slice(0, limit).map((item, i) => (
        <View key={i} style={s.barRow}>
          <Text style={s.barLabel} numberOfLines={1}>{item[labelKey]}</Text>
          <View style={s.barTrack}>
            <View style={[s.barFill, { width: `${(item[valueKey] / max) * 100}%`, backgroundColor: chartColors[i % chartColors.length] }]} />
          </View>
          <Text style={s.barValue}>{item[valueKey]}</Text>
        </View>
      ))}
    </View>
  );
}
