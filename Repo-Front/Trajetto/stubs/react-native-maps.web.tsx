// Substituto do react-native-maps quando o app roda no navegador.
//
// A biblioteca de mapas é só para celular: ela chega no código nativo do Android e do iOS,
// que não existe na web, e por isso derrubava o empacotamento inteiro — mesmo em telas que
// nada têm a ver com mapa. Aqui as peças viram um espaço reservado, o app abre no navegador
// e o mapa de verdade continua igual no celular.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const PROVIDER_DEFAULT = undefined;
export const PROVIDER_GOOGLE = undefined;

// Marcadores e traçados são desenhados dentro do mapa; sem mapa, não há o que desenhar.
export const Marker = () => null;
export const Polyline = () => null;
export const Callout = () => null;
export const Circle = () => null;

export default function MapView({ style }: { style?: any }) {
  return (
    <View style={[styles.placeholder, style]}>
      <Text style={styles.texto}>O mapa só aparece no aplicativo do celular.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8edf3',
  },
  texto: { fontSize: 13, color: '#6b7280', textAlign: 'center', paddingHorizontal: 24 },
});
