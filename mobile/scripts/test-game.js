import assert from 'node:assert/strict';
import { computeProgress, baseXP, levelFromTotalXP, xpForLevel, dayKey } from '../src/game/gamification';
import { questsForDay } from '../src/game/quests';
import { INITIAL_STATE, normalizeState } from '../src/game/store';
import { parseMeasurement, bodySummary } from '../src/game/body';
import { setValue, setWeightKg, formatSet } from '../src/game/session';
import { rewardPresentation } from '../src/game/rewardPresentation';
import { hunterEvolution, validAppearanceChoice } from '../src/game/evolution';
import { DEFAULT_TRAINING_PLAN,cleanTrainingPlan,trainingToday,validateDetailedSet,estimatedOneRepMax,exerciseInsights,nextLoadSuggestion } from '../src/game/fitnessPro';
import { bossCampaigns,earnedBossRewards } from '../src/game/bosses';
import {performanceOverview,validateRecovery} from '../src/game/performance';
import {worldProgress,worldUnlockedGear,selectWorldGear} from '../src/game/hunterWorld';
import {smartLoadAdvice,groupSuperset,workoutWeekSummary} from '../src/game/smartTraining';
import {mentorBrief} from '../src/game/mentor';
import {sanitizeGuild,localGuildChallenges} from '../src/game/guild';
import {safeCreatorChoice,portraitOptions} from '../src/game/characterCreator';
import {minimalAIPayload} from '../src/cloud/ai';
import {minimalGuildStats} from '../src/cloud/guild';
import { trialsForWeek, earnedWeeklyTrials } from '../src/game/weeklyTrials';
import { weekKey } from '../src/game/gamification';
import { computeStats, computeExerciseRecords, newRecords } from '../src/game/stats';
import { intervalStatus, pomodoroStatus, sessionMinutes, createSession } from '../src/game/session';
import { serializeBackup, parseBackup } from '../src/game/backup';
import { computeAchievements, newlyUnlocked } from '../src/game/achievements';
import { PROGRAMS, programRunStatus, programDayXP, finishedPrograms, PROGRAM_FINISH_BONUS } from '../src/game/programs';

const character = { name: 'Teszt', classId: 'hero' };
const at = (day, hour = 12) => new Date(`${day}T${String(hour).padStart(2, '0')}:00:00`).toISOString();
const workout = (id, day) => ({ id, type: 'workout', title: 'x', duration: 30, intensity: 7, date: at(day) });
const state = (activities, questCompletions = []) => ({ ...INITIAL_STATE, character, activities, questCompletions });

assert.equal(baseXP('workout', 30, 7), 63);
assert.equal(baseXP('journal', 1, 1), 5);

assert.deepEqual(levelFromTotalXP(0), { level: 1, xp: 0, xpToNextLevel: 100 });
assert.equal(levelFromTotalXP(99).level, 1);
assert.equal(levelFromTotalXP(100).level, 2);
assert.equal(levelFromTotalXP(100 + xpForLevel(2)).level, 3);

const today = '2026-10-19';
let p = computeProgress(state([workout('a', '2026-10-17'), workout('b', '2026-10-18'), workout('c', today)]), today);
assert.equal(p.streak, 3);
assert.equal(p.activeToday, true);
assert.equal(p.xpById.c, Math.round(63 * 1.1));

p = computeProgress(state([workout('a', '2026-10-17'), workout('b', '2026-10-18')]), today);
assert.equal(p.streak, 2, 'streak survives until the end of the next day');
assert.equal(p.activeToday, false);

p = computeProgress(state([workout('a', '2026-10-15')]), today);
assert.equal(p.streak, 0, 'streak breaks after a missed day');

p = computeProgress(state([workout('a', '2026-10-16'), workout('b', '2026-10-18'), workout('c', today)]), today);
assert.equal(p.streak, 3, 'one missed day is a rest day');
assert.ok(p.restDays.has('2026-10-17'));

p = computeProgress(state([workout('a', '2026-10-15'), workout('b', '2026-10-18'), workout('c', today)]), today);
assert.equal(p.streak, 2, 'two missed days break the streak');

p = computeProgress(state([
  workout('a', '2026-10-12'), workout('b', '2026-10-14'), workout('c', '2026-10-16'), workout('d', '2026-10-17')
]), '2026-10-17');
assert.equal(p.streak, 2, 'second rest day in the same week breaks the streak');
assert.equal(p.longestStreak, 2);

p = computeProgress(state([workout('a', '2026-10-09'), workout('b', '2026-10-11'), workout('c', '2026-10-13')]), '2026-10-13');
assert.equal(p.streak, 3, 'rest days in different weeks both count');

p = computeProgress(state([workout('a', '2026-10-17')]), today);
assert.equal(p.streak, 1, 'missing yesterday keeps the streak alive as a pending rest day');
assert.equal(p.restPending, true);
assert.equal(p.nextStreakMultiplier, 1.0);

p = computeProgress(state([workout('a', today), { ...workout('b', today), date: at(today, 18) }]), today);
assert.equal(p.streak, 1, 'two entries on one day count once');

const full = state([workout('a', '2026-10-18'), workout('b', today)]);
const withoutB = { ...full, activities: full.activities.filter((a) => a.id !== 'b') };
assert.equal(computeProgress(withoutB, today).totalXP, computeProgress(state([workout('a', '2026-10-18')]), today).totalXP);

const quests = questsForDay(today);
assert.equal(quests.length, 3);
assert.deepEqual(quests.map((q) => q.category), ['physical', 'mental', 'recovery']);
assert.deepEqual(questsForDay(today), quests, 'same quests all day');
const q = quests[0];
p = computeProgress(state([], [{ questId: q.id, date: today }]), today);
assert.equal(p.totalXP, q.xp);

p = computeProgress(state([]), today);
assert.deepEqual(p.attributes, { strength: 14, stamina: 12, agility: 8, intelligence: 6, willpower: 10 });
p = computeProgress(state([workout('a', today)]), today);
assert.equal(p.attributes.strength, 16);

assert.equal(dayKey(new Date(2026, 0, 5)), '2026-01-05');

{
  const st = state([workout('a', '2026-10-13'), workout('b', '2026-10-14'), { ...workout('c', today), type: 'study', duration: 60 }]);
  const pr = computeProgress(st, today);
  const stats = computeStats(st, pr, today);
  assert.equal(stats.heatmap.length, 12);
  assert.equal(stats.heatmap[11][0].key, today, 'last row starts on this Monday');
  assert.equal(stats.heatmap[11][0].level, 3);
  assert.equal(stats.heatmap[11][1].future, true);
  assert.equal(stats.heatmap[10][1].level, 2, '30 min on 2026-10-13');
  assert.equal(stats.weeklyXP.length, 8);
  assert.equal(stats.weeklyXP[6].xp, pr.xpById.a + pr.xpById.b + 35);
  assert.equal(stats.minutesByType.study, 60);
  assert.equal(stats.records.bestWeekMinutes, 60);
  assert.equal(stats.records.activeDays, 3);
}

{
  const st = state([workout('a', today)], [{ questId: 'water', date: today }]);
  assert.deepEqual(parseBackup(serializeBackup(st)).activities, st.activities);
  assert.deepEqual(parseBackup(serializeBackup({ ...st, settings: undefined })).settings.weeklyGoals, [], 'old saves get defaults');
  assert.throws(() => parseBackup('nem json'), /hibás formátum/);
  assert.throws(() => parseBackup(JSON.stringify({ app: 'mas', state: {} })), /nem egy Edzi/);
  assert.throws(() => parseBackup(JSON.stringify({ app: 'edzi', state: { activities: [{ id: 1 }], questCompletions: [] } })), /nem egy Edzi/);
}

{
  const week = ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15'].map((d, i) => workout(`w${i}`, d));
  const three = computeProgress(state(week.slice(0, 3)), '2026-10-15');
  const four = computeProgress(state(week), '2026-10-15');
  assert.equal(three.weeksGoalMet, 0);
  assert.equal(four.weeksGoalMet, 1);
  assert.equal(four.totalXP - three.totalXP, four.xpById.w3 + 50 + 50, 'goal bonus +50 and 120-minute weekly trial +50');
  assert.equal(four.thisWeekActiveDays, 4);

  const loweredLater = { ...state(week.slice(0, 2)), settings: { weeklyGoals: [{ from: '2026-10-19', goal: 1 }] } };
  assert.equal(computeProgress(loweredLater, today).weeksGoalMet, 0, 'lowering the goal does not pay out past weeks');
  assert.equal(computeProgress(loweredLater, today).weeklyGoal, 1);
  const loweredBefore = { ...state(week.slice(0, 2)), settings: { weeklyGoals: [{ from: '2026-10-12', goal: 2 }] } };
  assert.equal(computeProgress(loweredBefore, today).weeksGoalMet, 1);
}

{
  assert.deepEqual(PROGRAMS.map((p) => p.days.length), [30, 28, 14]);
  assert.match(PROGRAMS[0].days[0].tasks[0], /^10 fekvőtámasz/);
  assert.match(PROGRAMS[0].days[29].tasks[0], /^100 fekvőtámasz/);
  assert.equal(PROGRAMS[0].days[6].rest, true);
  assert.equal(programDayXP('saitama30', 30), 40 + PROGRAM_FINISH_BONUS);

  const run = { id: 'breathing14', startDate: '2026-10-18' };
  let st = { ...state([]), program: run, programDays: [{ programId: 'breathing14', runStart: '2026-10-18', day: 1, date: '2026-10-18' }] };
  let s1 = programRunStatus(st, today);
  assert.equal(s1.doneToday, false);
  assert.equal(s1.currentDay, 2);
  st = { ...st, programDays: [...st.programDays, { programId: 'breathing14', runStart: '2026-10-18', day: 2, date: today }] };
  s1 = programRunStatus(st, today);
  assert.equal(s1.doneToday, true);
  assert.equal(s1.currentDay, 2);
  assert.equal(computeProgress(st, today).totalXP, programDayXP('breathing14', 1) + programDayXP('breathing14', 2));

  const done = Array.from({ length: 14 }, (_, i) => ({ programId: 'breathing14', runStart: 'x', day: i + 1, date: `d${i}` }));
  assert.equal(finishedPrograms({ programDays: done }), 1);
  assert.equal(finishedPrograms({ programDays: done.slice(0, 13) }), 0);
}

{
  const empty = state([]);
  const before = computeAchievements(empty, computeProgress(empty, today));
  assert.ok(before.length >= 20);
  assert.equal(before.filter((a) => a.unlocked).length, 0);
  const one = state([{ ...workout('a', today), date: at(today, 6) }]);
  const after = computeAchievements(one, computeProgress(one, today));
  assert.deepEqual(newlyUnlocked(before, after).map((a) => a.id).sort(), ['early', 'first_log']);
  const logs10 = after.find((a) => a.id === 'logs_10');
  assert.deepEqual([logs10.current, logs10.target], [1, 10]);
}

{
  const withEx = (id, day, sets) => ({ ...workout(id, day), exercises: [{ name: 'Fekvőtámasz', unit: 'reps', sets }] });
  const before = computeExerciseRecords(state([withEx('a', '2026-10-17', [10, 12])]));
  const st = state([withEx('a', '2026-10-17', [10, 12]), withEx('b', today, [15, 8, 8])]);
  const rec = computeExerciseRecords(st);
  assert.deepEqual(
    [rec['Fekvőtámasz'].bestSet, rec['Fekvőtámasz'].bestSession, rec['Fekvőtámasz'].total, rec['Fekvőtámasz'].sessions],
    [15, 31, 53, 2]
  );
  assert.deepEqual(rec['Fekvőtámasz'].history.map((h) => h.value), [12, 15]);
  assert.deepEqual(newRecords(before, rec, ['Fekvőtámasz']), ['Fekvőtámasz']);
  assert.deepEqual(newRecords({}, rec, ['Fekvőtámasz']), [], 'first entry is not a record');
  const ach = computeAchievements(st, computeProgress(st, today)).find((a) => a.id === 'pushups_100');
  assert.equal(ach.current, 53);
}

{
  const t0 = 1_000_000;
  const preset = { work: 40, rest: 20, rounds: 2, startedAt: t0 };
  assert.deepEqual(intervalStatus(preset, t0 + 10_000), { done: false, round: 1, phase: 'work', remaining: 30, workSeconds: 10 });
  assert.equal(intervalStatus(preset, t0 + 45_000).phase, 'rest');
  assert.equal(intervalStatus(preset, t0 + 65_000).round, 2);
  assert.equal(intervalStatus(preset, t0 + 100_000).done, true, 'no trailing rest after the last round');
  assert.equal(intervalStatus(preset, t0 + 100_000).workSeconds, 80);

  const p0 = pomodoroStatus(t0, t0 + 10 * 60_000);
  assert.deepEqual([p0.phase, p0.round, p0.focusMinutes, p0.completedRounds], ['focus', 1, 10, 0]);
  const p1 = pomodoroStatus(t0, t0 + 27 * 60_000);
  assert.deepEqual([p1.phase, p1.focusMinutes, p1.completedRounds], ['break', 25, 1]);
  assert.equal(pomodoroStatus(t0, t0 + 70 * 60_000).focusMinutes, 60);

  const s = createSession({ title: 'x', exercises: [{ name: 'Plank', unit: 'sec' }] }, t0);
  assert.equal(sessionMinutes(s, t0 + 10_000), 1, 'at least one minute');
  assert.equal(sessionMinutes(s, t0 + 31 * 60_000), 31);
}

{
  const migrated = normalizeState({ version: 1, activities: [], questCompletions: [] });
  assert.equal(migrated.version, 4);
  assert.deepEqual(migrated.bodyMeasurements, []);
  assert.deepEqual(migrated.profile, { goalWeightKg: null });
  assert.deepEqual(normalizeState(null).programDays, []);
  assert.deepEqual(normalizeState({version:2}).recoveryEntries, []);
  assert.equal(normalizeState({}).preferences.appMode,'hunter');

  const corrupt = { ...state([]), questCompletions: 'not-an-array' };
  assert.throws(() => parseBackup(serializeBackup(corrupt)), /sérült/);
  const brokenActivity = { ...state([]), activities: [{ ...workout('a', today), duration: -1 }] };
  assert.throws(() => parseBackup(serializeBackup(brokenActivity)), /sérült/);
  const linked = { ...state([workout('a', today)]),
    programDays: [{ programId: 'saitama30', runStart: today, day: 1, date: today, activityId: 'a' }] };
  assert.deepEqual(parseBackup(serializeBackup(linked)).programDays, linked.programDays);
}
{
  assert.deepEqual(parseMeasurement({ weightKg: '86,5', waistCm: '89,1' }), {
    weightKg: 86.5, waistCm: 89.1, chestCm: null, hipsCm: null, armCm: null, thighCm: null
  });
  assert.throws(() => parseMeasurement({ weightKg: 'nem szám' }));
  const measurements = [{ id: 'a', date: '2026-10-01T12:00:00Z', weightKg: 87 },
    { id: 'b', date: '2026-10-09T12:00:00Z', weightKg: 86.5 }];
  assert.equal(bodySummary(measurements).changeKg, -0.5);
  assert.equal(bodySummary([]).latest, null);
  assert.equal(setValue({ reps: 8, weightKg: 60 }), 8);
  assert.equal(setWeightKg(10), 0);
  assert.equal(formatSet({ reps: 8, weightKg: 60 }, 'reps'), '8 × 60 kg');
  assert.equal(formatSet(10, 'reps'), '10 ism.');
  assert.equal(formatSet({reps:8,weightKg:60,rpe:7,rir:3},'reps'),'8 × 60 kg · RPE 7 · RIR 3');
  const weighted = { ...workout('w', today),
    exercises: [{ name: 'Fekvenyomás', unit: 'reps',
      sets: [{ reps: 8, weightKg: 60 }, { reps: 6, weightKg: 70 }] }] };
  const r = computeExerciseRecords(state([weighted]))['Fekvenyomás'];
  assert.equal(r.bestSet, 8);
  assert.equal(r.bestWeightKg, 70);
  assert.equal(r.volumeKg, 900);
  assert.deepEqual(parseBackup(serializeBackup({ ...state([weighted]), bodyMeasurements: measurements })).bodyMeasurements, measurements);
}
{
  const entries = ['2026-10-19', '2026-10-20', '2026-10-21'].map((d, i) => workout(`w${i}`, d));
  const st = state([...entries, { ...workout('study', today), type: 'study', duration: 60 }]);
  const trials = trialsForWeek(st, '2026-10-19', weekKey, dayKey);
  assert.deepEqual(trials.map((t) => t.completed), [true, false, true]);
  const reward = earnedWeeklyTrials(st, weekKey, dayKey);
  assert.equal(reward.xp, 100);
  assert.equal(reward.completed, 2);
  const statResult = computeStats(st, computeProgress(st, '2026-10-21'), '2026-10-21');
  assert.equal(statResult.weeklyXP.at(-1).xp,
    entries.reduce((n, a) => n + computeProgress(st, '2026-10-21').xpById[a.id], 0) +
    computeProgress(st, '2026-10-21').xpById.study + reward.xp + 80);
  assert.equal(computeProgress(st, '2026-10-21').weeklyTrialXP, 100);
  const removed = { ...st, activities: st.activities.filter((a) => a.id !== 'w2') };
  assert.equal(computeProgress(removed, '2026-10-21').weeklyTrialXP, 40);
  const achievements = computeAchievements(st, computeProgress(st, '2026-10-21'));
  assert.equal(achievements.find((a) => a.id === 'trial_1').unlocked, true);
  const withSets = { ...st, activities: [...st.activities, {
    ...workout('weights', today),
    exercises: [{ name: 'Fekvenyomás', unit: 'reps',
      sets: [{ reps: 5, weightKg: 100 }, { reps: 5, weightKg: 100 }] }]
  }] };
  assert.equal(computeAchievements(withSets, computeProgress(withSets, today)).find((a) => a.id === 'volume_5000').current, 1000);
}
{
  const level = rewardPresentation({ xpGained: 32, leveledUp: true, level: 4, achievements: [] }, 'Edzés kész');
  assert.equal(level.heading, 'SZINTLÉPÉS!');
  assert.equal(level.xp, 32);
  assert.equal(rewardPresentation({ xpGained: 0, evolved: true }).heading, 'EVOLÚCIÓ!');
  assert.equal(rewardPresentation(null).xp, 0);
}
{
  const basic=state([]);
  const evolution=hunterEvolution(character,computeProgress(basic,today),0);
  assert.equal(evolution.style.id,'origin');
  assert.equal(validAppearanceChoice('style','legend',evolution),false);
  const higher=hunterEvolution({name:'Teszt',classId:'hero',appearance:{styleId:'vanguard'}},
    {...computeProgress(basic,today),level:8},2);
  assert.equal(higher.style.id,'vanguard');
  assert.equal(higher.trails.find(t=>t.id==='ember').unlocked,true);
  assert.equal(trainingToday(DEFAULT_TRAINING_PLAN,'2026-10-19').weekday,1);
  assert.equal(cleanTrainingPlan(null).days.length,3);
  assert.deepEqual(validateDetailedSet({reps:8,weightKg:60,rpe:8,rir:2,warmup:true}),
    {reps:8,weightKg:60,rpe:8,rir:2,warmup:true});
  assert.throws(()=>validateDetailedSet({reps:8,weightKg:60,rpe:11}),/RPE/);
  assert.equal(estimatedOneRepMax(8,60),76);
  const w={...workout('bar','2026-10-19'),exercises:[{name:'Fekvenyomás',unit:'reps',sets:[
    {reps:8,weightKg:60,rpe:7,rir:3},{reps:5,weightKg:70,rpe:9,rir:1,warmup:true}]}]};
  const data=exerciseInsights([w],'Fekvenyomás');
  assert.equal(data.volumeKg,480);
  assert.equal(data.bestEstimated1RM,76);
  assert.equal(nextLoadSuggestion([w],'Fekvenyomás').weightKg,62.5);
  const bossState=state([workout('mon','2026-10-19'),workout('tue','2026-10-20'),workout('wed','2026-10-21')]);
  const bosses=bossCampaigns(bossState,'2026-10-21');
  assert.deepEqual(bosses.map(b=>b.complete),[true,true,false]);
  assert.deepEqual(earnedBossRewards(bossState),{xp:80,wins:2});
  assert.equal(computeProgress(bossState,'2026-10-21').bossXP,80);
  assert.equal(computeStats(bossState,computeProgress(bossState,'2026-10-21'),'2026-10-21').weeklyXP.at(-1).xp,
    Object.values(computeProgress(bossState,'2026-10-21').xpById).reduce((a,b)=>a+b,0)
    +computeProgress(bossState,'2026-10-21').weeklyTrialXP+80);
  const afterDelete={...bossState,activities:[bossState.activities[0]]};
  assert.equal(earnedBossRewards(afterDelete).xp,0);
  const check=validateRecovery(4,'Több energiám volt');
  assert.deepEqual(check,{readiness:4,note:'Több energiám volt'});
  assert.throws(()=>validateRecovery(6),/1–5/);
  const perf=performanceOverview({...bossState,recoveryEntries:[{id:'r',date:at('2026-10-21'),readiness:2}]},'2026-10-21');
  assert.equal(perf.current.sessions,3);
  assert.match(perf.insight,/Alacsony/);
  const v3={...bossState,trainingPlan:DEFAULT_TRAINING_PLAN,recoveryEntries:[{id:'r',date:at(today),readiness:4}],preferences:{appMode:'performance'}};
  const restored=parseBackup(serializeBackup(v3));
  assert.equal(restored.preferences.appMode,'performance');
  assert.equal(restored.trainingPlan.days.length,3);
  assert.equal(restored.recoveryEntries.length,1);
  assert.throws(()=>parseBackup(serializeBackup({...v3,recoveryEntries:[{date:'x',readiness:9}]})),/sérült/);
  const badRPE={...v3,activities:[{...w,exercises:[{name:'Fekvenyomás',unit:'reps',sets:[{reps:8,weightKg:50,rpe:99}]}]}]};
  assert.throws(()=>parseBackup(serializeBackup(badRPE)),/sérült/);
}
{
  const log = state([workout('mon','2026-10-19'),workout('tue','2026-10-20'),
    workout('wed','2026-10-21')]);
  const levels={level:25,bossWins:5};
  const regions=worldProgress(log,levels,'2026-10-21');
  assert.deepEqual(regions.slice(0,3).map(x=>x.complete),[true,true,false]);
  assert.equal(worldUnlockedGear(regions).filter(x=>x.unlocked).length,2);
  assert.equal(selectWorldGear(character,regions).id,'forest');
  const after={...log,activities:log.activities.slice(0,1)};
  assert.equal(worldUnlockedGear(worldProgress(after,levels,'2026-10-21')).filter(x=>x.unlocked).length,1);
  assert.equal(safeCreatorChoice('visor','aurora'),true);
  assert.equal(safeCreatorChoice('helmet','unknown'),false);
  assert.equal(portraitOptions({appearance:{visorId:'ember'}},{accent:'#123456'}).visorColor,'#F7B46B');

  const bench=(id,day,effort)=>({...workout(id,day),exercises:[{name:'Fekvenyomás',
    unit:'reps',weighted:true,sets:[{reps:8,weightKg:60,rpe:effort,rir:3}]}]});
  const training=state([bench('a','2026-10-19',7),bench('b','2026-10-20',7)]);
  assert.equal(smartLoadAdvice(training,'Fekvenyomás','2026-10-20').weightKg,62.5);
  assert.equal(smartLoadAdvice({...training,recoveryEntries:[{id:'r',date:at('2026-10-20'),readiness:1}]},
    'Fekvenyomás','2026-10-20').kind,'recovery');
  assert.equal(smartLoadAdvice(state([bench('c','2026-10-20',10)]),'Fekvenyomás','2026-10-20').kind,'hold');
  assert.equal(workoutWeekSummary(training,'2026-10-20').sessions,2);
  assert.deepEqual(groupSuperset(['A','B'],'A','B').names,['A','B']);
  assert.throws(()=>groupSuperset(['A','B'],'A','A'),/két|Két/);

  const insight=mentorBrief(training,{level:3},'2026-10-20');
  assert.equal(insight.isGenerativeAI,false);
  assert.equal(insight.source,'on-device');
  assert.equal(insight.explanation.length,3);
  assert.equal(sanitizeGuild({name:'  Hunters  ',members:['Anna','Béla']} ).name,'Hunters');
  assert.equal(sanitizeGuild({name:' '}),null);
  assert.equal(localGuildChallenges(log,'2026-10-21')[0].complete,true);
  const shared=minimalGuildStats(log,'2026-10-21');
  assert.deepEqual(shared,{week:'2026-10-19',days:3,minutes:90,focus:0});
  const anon=minimalAIPayload(log,{level:7,streak:2});
  assert.deepEqual(Object.keys(anon).sort(),['currentStreak','hunterLevel','readiness','recentMinutes','recentWorkoutCount'].sort());
  assert.equal(anon.recentWorkoutCount,3);
  assert.ok(!JSON.stringify(anon).includes('Teszt'));
  assert.ok(!JSON.stringify(shared).includes('Teszt'));

  const v4={...training,guild:{name:'Ezüst osztag',members:['Anna']},
    supersets:[{id:'A::B',names:['A','B']}],
    character:{...character,appearance:{visorId:'ember',helmetId:'shadow',gearId:'origin'}}};
  const backup=parseBackup(serializeBackup(v4));
  assert.equal(backup.version,4);
  assert.equal(backup.guild.name,'Ezüst osztag');
  assert.equal(backup.supersets[0].names[1],'B');
  assert.equal(backup.character.appearance.visorId,'ember');
  assert.throws(()=>parseBackup(serializeBackup({...v4,guild:{name:'a',members:[22]}})),/sérült/);
  assert.throws(()=>parseBackup(serializeBackup({...v4,character:{...character,
    appearance:{visorId:'unknown'}}})),/sérült/);
}
console.log('Minden játéklogika teszt átment.');
