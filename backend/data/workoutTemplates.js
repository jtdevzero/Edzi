module.exports = [
  {
    id: "opm_hero",
    name: "One Punch Man Hero Training",
    anime: "One Punch Man",
    youtubeId: "I3fPGSpGoxg",
    description: "100 pushups, 100 situps, 100 squats, 10km run",
    exercises: [
      { name: "Pushups", reps: 100, youtubeId: "IODxDxX7oi4" },
      { name: "Situps", reps: 100, youtubeId: "1fbU_MkV7NE" },
      { name: "Squats", reps: 100, youtubeId: "aclHkVaku9U" },
      { name: "10km Run", duration: "60 min", youtubeId: "kVnyY17VS9Y" }
    ],
    xpReward: 250,
    difficulty: "extreme"
  },
  {
    id: "solo_shadow",
    name: "Solo Leveling Shadow Training",
    anime: "Solo Leveling",
    youtubeId: "kVnyY17VS9Y",
    description: "Progressive strength training like Sung Jin-Woo",
    exercises: [
      { name: "Pull-ups", reps: 30, youtubeId: "eGo4IYlbE5g" },
      { name: "Dips", reps: 50, youtubeId: "2z8JmcrW-As" },
      { name: "Burpees", reps: 30, youtubeId: "TU8QYVW0gDU" },
      { name: "Sprint intervals", duration: "20 min", youtubeId: "wnJTen-k8FE" }
    ],
    xpReward: 180,
    difficulty: "hard"
  },
  {
    id: "gtg_grease",
    name: "Grease the Groove (GTG)",
    anime: "Attack on Titan",
    youtubeId: "cKGPDLGkFbM",
    description: "Frequent sub-maximal reps throughout the day",
    exercises: [
      { name: "Pull-ups (GTG)", reps: 5, frequency: "every 2 hours", youtubeId: "eGo4IYlbE5g" },
      { name: "Pushups (GTG)", reps: 10, frequency: "every 2 hours", youtubeId: "IODxDxX7oi4" }
    ],
    xpReward: 80,
    difficulty: "easy"
  },
  {
    id: "demon_slayer_breathing",
    name: "Demon Slayer Breathing Forms",
    anime: "Demon Slayer",
    youtubeId: "tybOi4hjZFQ",
    description: "Breathing exercises + flexibility for focus and calm",
    exercises: [
      { name: "Box breathing", duration: "10 min", youtubeId: "tybOi4hjZFQ" },
      { name: "Sun salutation", reps: 5, youtubeId: "74jc-MtoYME" },
      { name: "Deep stretching", duration: "15 min", youtubeId: "g_tea8ZNk5A" }
    ],
    xpReward: 60,
    difficulty: "medium",
    category: "mindfulness"
  },
  {
    id: "aot_cardio",
    name: "Attack on Titan Cardio",
    anime: "Attack on Titan",
    youtubeId: "wnJTen-k8FE",
    description: "Survey Corps endurance HIIT protocol",
    exercises: [
      { name: "HIIT intervals", duration: "20 min", youtubeId: "ml6cT4AZdqI" },
      { name: "Stair climbs", duration: "10 min", youtubeId: "kVnyY17VS9Y" },
      { name: "Box jumps", reps: 20, youtubeId: "52HewnizG1w" }
    ],
    xpReward: 120,
    difficulty: "hard"
  }
];
