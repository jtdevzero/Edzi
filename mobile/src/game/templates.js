export function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export const WORKOUT_TEMPLATES = [
  {
    id: 'opm_hero',
    name: 'Saitama hősedzés',
    anime: 'One Punch Man',
    description: '100 fekvőtámasz, 100 felülés, 100 guggolás, 10 km futás. Kezdőknek: oszd el a napon.',
    duration: 90,
    intensity: 9,
    exercises: [
      { name: 'Fekvőtámasz', amount: '100 ism.', search: 'push up proper form' },
      { name: 'Felülés', amount: '100 ism.', search: 'sit up proper form' },
      { name: 'Guggolás', amount: '100 ism.', search: 'bodyweight squat proper form' },
      { name: 'Futás', amount: '10 km', search: 'running form beginners' }
    ]
  },
  {
    id: 'solo_shadow',
    name: 'Árnyvadász erőedzés',
    anime: 'Solo Leveling',
    description: 'Saját testsúlyos erőkör, ahogy Sung Jin-Woo kezdte.',
    duration: 45,
    intensity: 8,
    exercises: [
      { name: 'Húzódzkodás', amount: '5×6 ism.', search: 'pull up proper form' },
      { name: 'Tolódzkodás', amount: '5×10 ism.', search: 'dips proper form' },
      { name: 'Burpee', amount: '3×10 ism.', search: 'burpee proper form' },
      { name: 'Sprint intervallum', amount: '10 × 20 mp', search: 'sprint interval training' }
    ]
  },
  {
    id: 'gtg_grease',
    name: 'Grease the Groove',
    anime: 'Attack on Titan',
    description: 'Egész nap kis sorozatok, soha nem kifáradásig. 2 óránként egy kör.',
    duration: 15,
    intensity: 4,
    exercises: [
      { name: 'Húzódzkodás', amount: 'max. fele', search: 'grease the groove pull ups' },
      { name: 'Fekvőtámasz', amount: 'max. fele', search: 'grease the groove push ups' }
    ]
  },
  {
    id: 'aot_cardio',
    name: 'Felderítő egység kardió',
    anime: 'Attack on Titan',
    description: 'HIIT állóképességre, ahogy a Survey Corps edz.',
    duration: 30,
    intensity: 8,
    exercises: [
      { name: 'HIIT kör', amount: '20 perc', search: '20 minute hiit no equipment' },
      { name: 'Ugrásos guggolás', amount: '3×15 ism.', search: 'jump squat proper form' },
      { name: 'Hegymászó', amount: '3×30 mp', search: 'mountain climbers proper form' }
    ]
  },
  {
    id: 'demon_slayer_breathing',
    name: 'Démonvadász légzésforma',
    anime: 'Demon Slayer',
    description: 'Légzés és nyújtás a fókuszért, jó tanulás előtt.',
    duration: 20,
    intensity: 3,
    exercises: [
      { name: 'Box légzés', amount: '5 perc', search: 'box breathing guided' },
      { name: 'Napüdvözlet', amount: '5 kör', search: 'sun salutation beginners' },
      { name: 'Nyújtás', amount: '10 perc', search: 'full body stretch 10 minutes' }
    ]
  }
];
