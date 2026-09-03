import React from 'react';
import { Text, View } from 'react-native';
import { useColors } from '@/src/theme';
import { DESTINATIONS } from '@/src/pages/tabs/shared/data/destinations';
import DestinationCard from '@/src/pages/tabs/shared/components/DestinationCard/DestinationCard';
import { styles } from './styles';

export default function EmptyState({ destIndex }: { destIndex: number }) {
  const s = styles(useColors());
  const next1 = DESTINATIONS[(destIndex + 1) % DESTINATIONS.length];
  const next2 = DESTINATIONS[(destIndex + 2) % DESTINATIONS.length];
  const current = DESTINATIONS[destIndex];

  return (
    <View style={s.wrapper}>
      <View style={s.copyBlock}>
        <View style={s.copyRow}>
          <Text style={[s.emptyBody, s.emptyBodyTallLine]}>Crie seu primeiro</Text>
          <Text style={s.emptyHighlight}>roteiro</Text>
        </View>

        <View style={s.copyRowTight}>
          <Text style={s.emptyHighlight}>personalizado</Text>
          <Text style={[s.emptyBody, s.emptyBodyTallerLine]}>e comece a</Text>
        </View>

        <Text style={[s.emptyBody, s.emptyBodyLast]}>explorar o mundo.</Text>
      </View>

      <View style={s.emptyState}>
        <View style={s.cardsStack}>
          <DestinationCard
            title={current.title}
            subtitle={current.subtitle}
            time={current.time}
            image={current.image}
            bgColor={current.bgColor}
            rotation="-6deg"
            style={{ position: 'absolute', left: 0, top: 20 }}
            animKey={destIndex}
          />
          <DestinationCard
            title={next1.title}
            subtitle={next1.subtitle}
            time={next1.time}
            image={next1.image}
            bgColor={next1.bgColor}
            rotation="4deg"
            style={{ position: 'absolute', left: 60, top: 0 }}
            animKey={destIndex}
          />
          <DestinationCard
            title={next2.title}
            subtitle={next2.subtitle}
            time={next2.time}
            image={next2.image}
            bgColor={next2.bgColor}
            rotation="-2deg"
            style={{ position: 'absolute', left: 120, top: 30 }}
            animKey={destIndex}
          />
        </View>
      </View>
    </View>
  );
}
