import {dayKey} from './gamification';
import {performanceOverview} from './performance';
import {smartLoadAdvice} from './smartTraining';

// Explainable local coach: private, offline, deterministic. NOT generative AI.
export function mentorBrief(state,progress,today=dayKey()) {
  const perf=performanceOverview(state,today);
  const latest=perf.recentCheckin;
  const title=latest?.readiness<=2 ? 'Regenerációs nap' :
    perf.current.sessions===0 ? 'Kezdd a saját tempódban' :
    perf.change.minutesPct!=null && perf.change.minutesPct>50 ? 'Tartsd egyensúlyban a terhelést' :
    'A következetességed építi az erődet';
  const advice=latest?.readiness<=2 ?
    'A legutóbbi közérzeted alacsony volt. Könnyebb mozgás vagy pihenés is jó döntés lehet.' :
    perf.current.sessions===0 ?
    'Rögzíts egy rövid, technikailag kényelmes edzést. A pihenés és a fokozatos kezdés is számít.' :
    perf.change.minutesPct!=null && perf.change.minutesPct>50 ?
    'Az edzésidőd több mint 50%-kal nőtt. Ne emelj automatikusan minden gyakorlaton.' :
    'Nézd meg az edzésnaplódat, és csak megfelelő mozgásminőség mellett emelj a terhelésen.';
  const exercise=[...(state.activities||[])].sort((a,b)=>b.date.localeCompare(a.date))
    .flatMap(a=>(a.exercises||[]).filter(e=>e.weighted).map(e=>e.name))[0]||null;
  return {title,advice,training:exercise?smartLoadAdvice(state,exercise,today):null,
    exercise,explanation:[
      `Utóbbi 7 nap: ${perf.current.sessions} edzés, ${perf.current.minutes} perc.`,
      latest?`Legutóbbi közérzet: ${latest.readiness}/5.`:'Még nincs regenerációs bejegyzés.',
      `Hunter-szint: ${progress.level}.`
    ],source:'on-device',isGenerativeAI:false};
}
