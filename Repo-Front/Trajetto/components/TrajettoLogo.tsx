import React from 'react';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

export default function TrajettoLogo({ width = 280, height = 140 }) {
  const scale = width / 680;
  const h = height / (340 * scale);

  return (
    <Svg width={width} height={height} viewBox="0 0 680 340">

      {/* Linhas topográficas - bege */}
      <Path d="M190,170 Q250,130 340,145 Q430,160 490,130"
        fill="none" stroke="#B6A79A" strokeWidth={1.2} strokeLinecap="round" opacity={0.35} />
      <Path d="M175,185 Q245,148 340,160 Q435,172 505,143"
        fill="none" stroke="#B6A79A" strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
      <Path d="M160,200 Q240,165 340,175 Q440,185 520,157"
        fill="none" stroke="#B6A79A" strokeWidth={1.2} strokeLinecap="round" opacity={0.65} />
      <Path d="M148,215 Q235,182 340,190 Q445,198 533,172"
        fill="none" stroke="#B6A79A" strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />

      {/* Linha principal azul */}
      <Path d="M138,228 Q230,198 340,205 Q450,212 542,186"
        fill="none" stroke="#023665" strokeWidth={2} strokeLinecap="round" />

      {/* Ponto de destino */}
      <Circle cx={340} cy={145} r={5} fill="#023665" />
      <Circle cx={340} cy={145} r={10} fill="none" stroke="#023665" strokeWidth={1.5} opacity={0.4} />

      {/* Linha vertical sutil */}
      <Line x1={340} y1={155} x2={340} y2={228}
        stroke="#023665" strokeWidth={0.8} opacity={0.15}
        strokeDasharray="3,4" />

      {/* Wordmark */}
      <SvgText
        x={340} y={272}
        textAnchor="middle"
        fill="#023665"
        fontSize={36}
        fontWeight="500"
        letterSpacing={8}>
        TRAJETTO
      </SvgText>

      {/* Slogan */}
      <SvgText
        x={340} y={298}
        textAnchor="middle"
        fill="#B6A79A"
        fontSize={12}
        letterSpacing={3}>
        every journey, yours
      </SvgText>

    </Svg>
  );
}