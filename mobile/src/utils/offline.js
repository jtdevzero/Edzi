import { Platform } from 'react-native';
// Browser registration only. No private records are stored by the service worker.
export function registerOfflineSupport() {
  if (Platform.OS!=='web' || typeof window==='undefined') return;
  if (!('serviceWorker' in navigator)) return;
  if (!window.location.pathname.startsWith('/Edzi/')) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Edzi/sw.js', { scope:'/Edzi/' }).catch(()=>{});
  }, { once:true });
  // WebView/load event may have already fired.
  if (document.readyState === 'complete') {
    navigator.serviceWorker.register('/Edzi/sw.js', { scope:'/Edzi/' }).catch(()=>{});
  }
}
