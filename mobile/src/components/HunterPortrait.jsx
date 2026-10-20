import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Circle, Path, Polygon, Rect, Line, G } from 'react-native-svg';
import { colors } from '../theme';

/**
 * Procedural anime-inspired guardian artwork.
 * Entirely vector, offline-capable, no external art licences or network loading.
 */
export default function HunterPortrait({ classId = 'hero', accent = colors.primarySoft, armorAccent = colors.primarySoft, helmetStyle = 'vanguard', size = 260 }) {
  const sigil = classId === 'shadow' ? 'shadow' : classId === 'monk' ? 'monk' : 'blade';
  return <Svg width={size} height={size * 1.26} viewBox="0 0 280 354" accessibilityLabel="Stilizált vadász karakterportré">
    <Defs>
      <LinearGradient id="halo" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={accent} stopOpacity=".16"/>
        <Stop offset=".65" stopColor="#3249AF" stopOpacity=".07"/>
        <Stop offset="1" stopColor="#121626" stopOpacity="0"/>
      </LinearGradient>
      <LinearGradient id="armor" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#2D3B65"/>
        <Stop offset=".42" stopColor="#121D33"/>
        <Stop offset="1" stopColor="#070C17"/>
      </LinearGradient>
      <LinearGradient id="cloak" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="#080C18"/>
        <Stop offset=".55" stopColor="#1B2842"/>
        <Stop offset="1" stopColor="#080B18"/>
      </LinearGradient>
      <LinearGradient id="visor" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="#BDF5FF"/><Stop offset="1" stopColor={accent}/>
      </LinearGradient>
    </Defs>
    <Circle cx="150" cy="144" r="122" fill="url(#halo)"/>
    <Circle cx="150" cy="145" r="104" fill="none" stroke={accent} strokeWidth=".8" strokeOpacity=".28"/>
    <Circle cx="150" cy="145" r="91" fill="none" stroke={accent} strokeWidth="1" strokeOpacity=".25" strokeDasharray="3 9"/>
    <Circle cx="150" cy="145" r="71" fill="none" stroke={accent} strokeWidth=".6" strokeOpacity=".25"/>
    <Path d="M150 9 L156 27 L150 33 L144 27 Z M150 261 L156 274 L150 289 L144 274 Z" fill={accent} opacity=".7"/>
    <Path d="M17 145 L32 140 L36 145 L32 150 Z M264 145 L276 140 L279 145 L276 150 Z" fill={accent} opacity=".55"/>
    <G opacity=".33" stroke={accent} strokeWidth=".85">
      <Line x1="45" y1="59" x2="78" y2="92"/><Line x1="218" y1="63" x2="195" y2="87"/>
      <Line x1="70" y1="237" x2="100" y2="217"/><Line x1="228" y1="229" x2="202" y2="209"/>
    </G>
    {helmetStyle==='royal'&&<Path d="M107 93 L113 45 L139 67 L151 38 L173 69 L193 43 L199 91 Z" fill="#2B334D" stroke={armorAccent} strokeWidth="1.5"/>}
    {helmetStyle==='shadow'&&<Path d="M82 117 Q146 37 216 118 L195 139 L180 91 L119 92 L104 141 Z" fill="#0A1020" stroke={armorAccent} strokeWidth="1.5"/>}
    {sigil === 'blade' && <Path d="M219 41 L234 64 L153 238 L145 246 Z" fill="#9BADD5" opacity=".53"/>}
    {sigil === 'shadow' && <Path d="M226 49 L244 78 L192 207 L185 214 Z" fill={accent} opacity=".42"/>}
    {sigil === 'monk' && <Circle cx="150" cy="145" r="120" fill="none" stroke={colors.gold} strokeWidth="1" strokeOpacity=".17"/>}
    {/* Sharp asymmetric cloak silhouette */}
    <Path d="M109 204 Q72 219 48 257 L5 353 L275 353 L241 251 Q220 223 189 204 Z" fill="url(#cloak)" stroke="#43516D" strokeWidth="1.4"/>
    <Path d="M104 207 L67 243 L37 353 L112 353 L145 239 Z" fill="#10192E"/>
    <Path d="M189 207 L227 244 L262 353 L187 353 L154 239 Z" fill="#111C32"/>
    <Polygon points="91,224 143,259 111,353 54,353" fill="url(#armor)" stroke={armorAccent} strokeWidth="1"/>
    <Polygon points="202,223 151,259 184,353 243,353" fill="url(#armor)" stroke={armorAccent} strokeWidth="1"/>
    <Path d="M143 240 L169 262 L152 330 L129 266 Z" fill="#202C44" stroke={accent} strokeOpacity=".35"/>
    <Path d="M151 232 L141 275 L153 315 L165 272 Z" fill="#161D36" stroke={accent} strokeWidth=".6"/>
    <Path d="M109 212 L143 242 L127 261 L93 230 Z M193 212 L156 242 L174 262 L211 229 Z" fill="#283959" stroke="#66779B" strokeWidth="1.3"/>
    {/* Neck */}
    <Path d="M128 177 L129 221 L150 242 L173 218 L171 177 Z" fill="#141F36" stroke="#7282A0" strokeOpacity=".5"/>
    {/* Silhouette head and helmet */}
    <Path d="M106 113 Q108 79 146 73 Q185 73 193 110 L183 165 L167 193 L143 203 L121 188 L108 161 Z" fill="#131E36" stroke="#72829D" strokeWidth="1.7"/>
    <Path d="M106 117 L92 125 L103 86 L122 97 L115 71 L145 86 L173 62 L184 83 L204 82 L194 116 L184 127 L179 101 L160 87 L138 111 Z" fill="#0A1020" stroke="#495A7B" strokeWidth="1.3"/>
    <Path d="M109 137 L125 129 L148 144 L173 128 L188 135 L178 167 L150 188 L123 168 Z" fill="#0B1224"/>
    <Path d="M115 139 L140 147 L146 151 L133 155 L115 148 Z M185 139 L160 147 L154 151 L169 155 L185 148 Z" fill="url(#visor)" opacity=".9"/>
    <Path d="M134 175 L151 181 L167 175 L154 193 L145 193 Z" fill="#1E2C48"/>
    <Path d="M108 149 L125 183 L144 200 M190 148 L174 182 L156 201" fill="none" stroke="#50607D" strokeOpacity=".65" strokeWidth=".9"/>
    <Path d="M102 228 L108 249 L137 267 M196 228 L189 251 L164 267" fill="none" stroke={armorAccent} strokeWidth="1.6" opacity=".74"/>
    <Path d="M130 279 L152 303 L173 279" fill="none" stroke={accent} strokeWidth="1.2" opacity=".52"/>
    <Rect x="134" y="321" width="36" height="2" rx="1" fill={accent} opacity=".35"/>
  </Svg>;
}
