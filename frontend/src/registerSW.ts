export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Proactively check for service worker updates
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.update();
      }
    });

    if (import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            registration.update();
            console.log('[CivicMind] ServiceWorker registered and updated:', registration.scope);
          },
          (err) => {
            console.log('[CivicMind] ServiceWorker registration failed:', err);
          }
        );
      });
    }
  }
}
