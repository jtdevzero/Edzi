import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { ATTRIBUTES } from '../game/characters';
import { colors } from '../theme';

const WIDTH = 300;
const HEIGHT = 270;
const CX = WIDTH / 2;
const CY = 140;
const RADIUS = 82;
const FONT = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

function point(angle, r) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

const toPoints = (pts) => pts.map((p) => `${p.x},${p.y}`).join(' ');

export default function StatsRadar({ attributes, color = colors.primary }) {
  const angles = ATTRIBUTES.map((_, i) => (i * 360) / ATTRIBUTES.length);
  const highest = Math.max(...ATTRIBUTES.map((a) => attributes[a.key]));
  const scaleMax = Math.max(30, Math.ceil(highest / 10) * 10);
  const valuePoints = ATTRIBUTES.map((a, i) => point(angles[i], (attributes[a.key] / scaleMax) * RADIUS));

  return (
    <View style={styles.container}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        {[0.25, 0.5, 0.75, 1].map((s) => (
          <Polygon key={s} points={toPoints(angles.map((a) => point(a, RADIUS * s)))} fill="none" stroke={colors.cardBorder} strokeWidth="1" />
        ))}
        {angles.map((a, i) => {
          const outer = point(a, RADIUS);
          return <Line key={i} x1={CX} y1={CY} x2={outer.x} y2={outer.y} stroke={colors.cardBorder} strokeWidth="1" />;
        })}
        <Polygon points={toPoints(valuePoints)} fill={color} fillOpacity="0.35" stroke={color} strokeWidth="2" />
        {valuePoints.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} />)}
        {ATTRIBUTES.map((a, i) => {
          const pos = point(angles[i], RADIUS + 26);
          return (
            <React.Fragment key={a.key}>
              <SvgText x={pos.x} y={pos.y - 6} textAnchor="middle" fill={colors.textMuted} fontSize="11" fontFamily={FONT}>
                {a.label}
              </SvgText>
              <SvgText x={pos.x} y={pos.y + 9} textAnchor="middle" fill={colors.text} fontSize="14" fontWeight="bold" fontFamily={FONT}>
                {String(attributes[a.key])}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' }
});
