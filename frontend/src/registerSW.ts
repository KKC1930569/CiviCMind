export function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('[CivicMind] ServiceWorker registered with scope: ', registration.scope);
        },
        (err) => {
          console.log('[CivicMind] ServiceWorker registration failed: ', err);
        }
      );
    });
  }
}
