import React from 'react';
import { Text, View } from 'react-native';
import { chartColors, useColors } from '@/src/theme';
import { styles } from './styles';

type DonutLegendProps<T extends Record<string, any>> = {
  data: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  labelWidth?: number;
};

export default function DonutLegend<T extends Record<string, any>>({ data, labelKey, valueKey, labelWidth = 90 }: DonutLegendProps<T>) {
  const s = styles(useColors());
  const total = data.reduce((acc, d) => acc + d[valueKey], 0);

  return (
    <View style={s.donutLegend}>
      {data.map((item, i) => {
        const pct = total > 0 ? Math.round((item[valueKey] / total) * 100) : 0;
        return (
          <View key={i} style={s.donutRow}>
            <View style={[s.donutDot, { backgroundColor: chartColors[i % chartColors.length] }]} />
            <Text style={[s.donutLabel, { width: labelWidth }]} numberOfLines={1}>{item[labelKey]}</Text>
            <View style={s.donutBarTrack}>
              <View style={[s.donutBarFill, { width: `${pct}%`, backgroundColor: chartColors[i % chartColors.length] }]} />
            </View>
            <Text style={s.donutPct}>{pct}%</Text>
          </View>
        );
      })}
    </View>
  );
}
