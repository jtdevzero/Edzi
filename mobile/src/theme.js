// Edzi Ascension V2 · Obsidian / platinum / ultraviolet / aurora.
export const colors = {
  bg: '#05070F',
  card: '#101524',
  cardElevated: '#172036',
  cardBorder: '#2D3852',
  input: '#1A2438',
  text: '#F6F7FF',
  textMuted: '#9EABC1',
  textSoft: '#D9DFEF',
  primary: '#7664F6',
  primarySoft: '#B7ACFF',
  blue: '#5FADFF',
  cyan: '#77DBF3',
  gold: '#EFD19C',
  green: '#57D8AE',
  red: '#F1798B',
  shadow: '#000000',
  track: '#29354C',
  surface: '#090E1B',
  obsidian: '#05070F',
  platinum: '#F6F7FF',
  aurora: '#77DBF3',
  violet: '#7664F6',
  bronze: '#B59668'
};
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 40 };
export const radii = { sm: 12, md: 16, lg: 22, xl: 28, pill: 999 };
export const type = {
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2.2, color: colors.gold },
  h1: { fontSize: 34, fontWeight: '900', letterSpacing: -1.4, color: colors.text },
  h2: { fontSize: 22, fontWeight: '900', letterSpacing: -0.6, color: colors.text },
  number: { fontSize: 32, fontWeight: '900', letterSpacing: -1.2, color: colors.text },
  body: { fontSize: 14, lineHeight: 23, color: colors.textMuted }
};
export const card = {
  backgroundColor: colors.card,
  borderWidth: 1,
  borderColor: colors.cardBorder,
  borderRadius: radii.lg,
  padding: 20
};
export const glassCard = { ...card, backgroundColor: colors.cardElevated, borderColor: '#46516B' };
