import React from 'react';
import Svg, {
  Rect,
  Line,
  Path,
  Circle,
  Text as SvgText,
} from 'react-native-svg';

export default function RegisterIllustration({ width = 300, height = 133 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 680 300">

      {/* Blocos de quarteirão */}
      <Rect x="80" y="60" width="90" height="60" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="80" y="130" width="40" height="80" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="130" y="130" width="40" height="40" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="130" y="178" width="40" height="32" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="190" y="60" width="50" height="50" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="190" y="120" width="50" height="90" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="260" y="60" width="70" height="30" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="260" y="100" width="30" height="110" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="300" y="100" width="30" height="50" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="300" y="158" width="30" height="52" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="350" y="60" width="60" height="80" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="350" y="150" width="60" height="60" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="430" y="60" width="80" height="45" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="430" y="115" width="35" height="95" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="475" y="115" width="35" height="45" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="475" y="168" width="35" height="42" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="530" y="60" width="70" height="70" rx="4" fill="#B6A79A" opacity="0.12"/>
      <Rect x="530" y="140" width="70" height="70" rx="4" fill="#B6A79A" opacity="0.12"/>

      {/* Ruas */}
      <Line x1="80" y1="225" x2="600" y2="225" stroke="#B6A79A" strokeWidth="1" opacity="0.3"/>
      <Line x1="175" y1="50" x2="175" y2="225" stroke="#B6A79A" strokeWidth="1" opacity="0.3"/>
      <Line x1="245" y1="50" x2="245" y2="225" stroke="#B6A79A" strokeWidth="1" opacity="0.3"/>
      <Line x1="340" y1="50" x2="340" y2="225" stroke="#B6A79A" strokeWidth="1" opacity="0.3"/>
      <Line x1="420" y1="50" x2="420" y2="225" stroke="#B6A79A" strokeWidth="1" opacity="0.3"/>
      <Line x1="520" y1="50" x2="520" y2="225" stroke="#B6A79A" strokeWidth="1" opacity="0.3"/>
      <Line x1="80" y1="50" x2="600" y2="50" stroke="#B6A79A" strokeWidth="1" opacity="0.3"/>
      <Line x1="80" y1="118" x2="600" y2="118" stroke="#B6A79A" strokeWidth="1" opacity="0.3"/>

      {/* Rota sólida (sombra) */}
      <Path
        d="M110,225 L110,118 L245,118 L245,85 L340,85 L340,118 L520,118 L520,225"
        fill="none"
        stroke="#023665"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.25"
      />

      {/* Rota tracejada */}
      <Path
        d="M110,225 L110,118 L245,118 L245,85 L340,85 L340,118 L520,118 L520,225"
        fill="none"
        stroke="#023665"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6,5"
        opacity="0.7"
      />

      {/* Ponto de partida */}
      <Circle cx="110" cy="225" r="6" fill="#B6A79A"/>
      <Circle cx="110" cy="225" r="11" fill="none" stroke="#B6A79A" strokeWidth="1.5" opacity="0.5"/>

      {/* Pontos intermediários */}
      <Circle cx="245" cy="85" r="5" fill="#023665" opacity="0.4"/>
      <Circle cx="340" cy="85" r="5" fill="#023665" opacity="0.4"/>

      {/* Ponto de destino */}
      <Circle cx="520" cy="118" r="8" fill="#023665"/>
      <Circle cx="520" cy="118" r="14" fill="none" stroke="#023665" strokeWidth="1.5" opacity="0.3"/>
      <Circle cx="520" cy="118" r="20" fill="none" stroke="#023665" strokeWidth="1" opacity="0.15"/>

      {/* Cruz no destino */}
      <Line x1="520" y1="100" x2="520" y2="108" stroke="#023665" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <Line x1="520" y1="128" x2="520" y2="136" stroke="#023665" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <Line x1="502" y1="118" x2="510" y2="118" stroke="#023665" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <Line x1="530" y1="118" x2="538" y2="118" stroke="#023665" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>

      {/* Texto */}
      <SvgText
        x="340"
        y="268"
        textAnchor="middle"
        fontWeight="400"
        fontSize="17"
        fill="#B6A79A"
        letterSpacing="3"
      >
        start your trajetto
      </SvgText>

    </Svg>
  );
}