// ASCENSION / 2026 — shared tokens for the fitness × RPG product.
export const colors = {
  bg: '#060916',
  card: '#10172A',
  cardElevated: '#151E34',
  cardBorder: '#263451',
  input: '#1A2540',
  text: '#F6F8FF',
  textMuted: '#94A6C6',
  textSoft: '#D4DFFF',
  primary: '#725CFF',
  primarySoft: '#B2A8FF',
  blue: '#27C8FF',
  cyan: '#34E4E4',
  gold: '#FBCB6C',
  green: '#40E7AA',
  red: '#FF6E8C',
  shadow: '#000000',
  track: '#202D48',
  surface: '#0B1223'
};
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radii = { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 };
export const type = {
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2.4, color: colors.cyan },
  h1: { fontSize: 32, fontWeight: '900', letterSpacing: -1, color: colors.text },
  h2: { fontSize: 19, fontWeight: '800', letterSpacing: -.4, color: colors.text },
  number: { fontSize: 29, fontWeight: '900', letterSpacing: -.8, color: colors.text },
  body: { fontSize: 14, lineHeight: 22, color: colors.textMuted }
};
export const card = {
  backgroundColor: colors.card,
  borderColor: colors.cardBorder,
  borderWidth: 1,
  borderRadius: radii.lg,
  padding: 18
};
export const glassCard = {
  ...card,
  backgroundColor: colors.cardElevated,
  borderColor: '#34436B'
};
