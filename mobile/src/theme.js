// EDZI NIGHTFALL — premium expedition HUD.
// Warm platinum + signal-amber + electric mint over charcoal/navy.
// The entire design system is offline and does not require external fonts or assets.
export const colors = {
  bg:'#05080D',
  card:'#111923',
  cardElevated:'#18232E',
  cardBorder:'#2C3B45',
  input:'#192530',
  text:'#F7F5EF',
  textMuted:'#9CAEB5',
  textSoft:'#D9E6E4',
  primary:'#5C7FFF',
  primarySoft:'#A8B9FF',
  blue:'#82AFFF',
  cyan:'#6EE3D8',
  gold:'#F6C67B',
  green:'#63DCA7',
  red:'#F17C8E',
  shadow:'#000000',
  track:'#29343E',
  surface:'#0B1118',
  obsidian:'#05080D',
  platinum:'#F7F5EF',
  aurora:'#6EE3D8',
  violet:'#887DFF',
  bronze:'#F6C67B'
};
export const nightfall = {
  ink:'#05080D', midnight:'#0B1118', panel:'#141E27',
  horizon:'#20343A', amber:'#F6C67B', amberMuted:'#9B7952',
  mint:'#6EE3D8', ice:'#B4DDE4', pearl:'#F7F5EF',
  line:'rgba(220,239,228,.16)'
};
export const space={xs:4,sm:8,md:12,lg:16,xl:24,xxl:32,xxxl:40};
export const radii={sm:12,md:16,lg:22,xl:28,pill:999};
export const type={
  eyebrow:{fontSize:10,fontWeight:'900',letterSpacing:2.1,color:colors.gold},
  h1:{fontSize:36,fontWeight:'900',letterSpacing:-1.6,color:colors.text},
  h2:{fontSize:23,fontWeight:'900',letterSpacing:-.8,color:colors.text},
  number:{fontSize:34,fontWeight:'900',letterSpacing:-1.2,color:colors.text},
  body:{fontSize:14,lineHeight:23,color:colors.textMuted}
};
export const card={
  backgroundColor:colors.card,
  borderWidth:1,
  borderColor:colors.cardBorder,
  borderRadius:radii.lg,
  padding:19
};
export const glassCard={...card,backgroundColor:colors.cardElevated,borderColor:'#42606A'};
