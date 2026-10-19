import { normalizeState } from './store';
import { dayKey } from './gamification';

const BACKUP_APP = 'edzi';
const hasDOM = () => typeof document !== 'undefined';

export function serializeBackup(state) {
  return JSON.stringify({ app: BACKUP_APP, exportedAt: new Date().toISOString(), state }, null, 2);
}

export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Ez nem egy Edzi mentésfájl (hibás formátum).');
  }
  const s = data?.state;
  const valid = data?.app === BACKUP_APP && s && typeof s === 'object' &&
    Array.isArray(s.activities) && Array.isArray(s.questCompletions) &&
    s.activities.every((a) => a && typeof a.id === 'string' && typeof a.date === 'string' &&
      typeof a.duration === 'number' && typeof a.intensity === 'number' && typeof a.type === 'string');
  if (!valid) throw new Error('Ez nem egy Edzi mentésfájl, vagy sérült.');
  return normalizeState(s);
}

export async function downloadBackup(state) {
  if (!hasDOM()) throw new Error('A mentés egyelőre csak a webes verzióban működik.');
  const filename = `edzi-mentes-${dayKey()}.json`;
  const blob = new Blob([serializeBackup(state)], { type: 'application/json' });
  const file = typeof File === 'function' ? new File([blob], filename, { type: 'application/json' }) : null;

  if (file && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Edzi mentés' });
      return true;
    } catch (err) {
      if (err?.name === 'AbortError') return false;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

export function pickBackupFile() {
  if (!hasDOM()) return Promise.reject(new Error('A visszatöltés egyelőre csak a webes verzióban működik.'));
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      file.text().then((text) => {
        try {
          resolve(parseBackup(text));
        } catch (err) {
          reject(err);
        }
      }, reject);
    };
    input.click();
  });
}
