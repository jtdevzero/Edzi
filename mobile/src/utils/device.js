let audioCtx = null;

// Browsers only allow audio after a user gesture, so call this from a tap handler first.
export function unlockAudio() {
  if (typeof window === 'undefined') return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  if (!audioCtx) audioCtx = new Ctx();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

export function beep(times = 1, frequency = 880) {
  if (!audioCtx) return;
  for (let i = 0; i < times; i++) {
    const start = audioCtx.currentTime + i * 0.25;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + 0.2);
  }
  navigatorVibrate(times);
}

function navigatorVibrate(times) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(Array.from({ length: times * 2 - 1 }, (_, i) => (i % 2 ? 100 : 150)));
  }
}

export function keepScreenAwake() {
  if (typeof navigator === 'undefined' || !navigator.wakeLock) return () => {};
  let lock = null;
  let released = false;
  const acquire = async () => {
    try {
      lock = await navigator.wakeLock.request('screen');
    } catch {
      lock = null;
    }
  };
  const onVisible = () => {
    if (!released && document.visibilityState === 'visible') acquire();
  };
  acquire();
  document.addEventListener('visibilitychange', onVisible);
  return () => {
    released = true;
    document.removeEventListener('visibilitychange', onVisible);
    lock?.release().catch(() => {});
  };
}
