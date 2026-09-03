import React from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { useColors } from '@/src/theme';
import { DESTINATIONS } from '../../data/destinations';
import DestinationCard from '../DestinationCard/DestinationCard';
import { styles } from './styles';

export default function NoItineraryEmptyState({ destIndex }: { destIndex: number }) {
  const router = useRouter();
  const s = styles(useColors());
  const current = DESTINATIONS[destIndex];
  const next1 = DESTINATIONS[(destIndex + 1) % DESTINATIONS.length];
  const next2 = DESTINATIONS[(destIndex + 2) % DESTINATIONS.length];

  return (
    <View style={s.wrapper}>
      <View style={s.copyBlock}>
        <Text style={[s.emptyBody, s.emptyBodyFirst]}>
          Gere um roteiro personalizado
        </Text>
        <View style={s.copyRow}>
          <Text style={[s.emptyBody, s.emptyBodyTallLine]}>e planeje seu</Text>
          <Text style={s.emptyHighlight}>Trajetto</Text>
        </View>
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

      <View style={s.buttonWrapper}>
        <CustomButton
          title="Ir para Início"
          onPress={() => router.push('/')}
        />
      </View>
    </View>
  );
}
