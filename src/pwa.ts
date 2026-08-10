import { registerSW } from "virtual:pwa-register";

/** Registers the service worker with silent auto-update.
 * Exposed via a tiny pub/sub so UI can show "nieuwe versie beschikbaar". */
type Listener = () => void;
let updateAvailable = false;
const listeners = new Set<Listener>();

export function onSWUpdate(cb: Listener) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function isUpdateAvailable() {
  return updateAvailable;
}

export function initPWA() {
  const updateSW = registerSW({
    onNeedRefresh() {
      updateAvailable = true;
      listeners.forEach((l) => l());
    },
    onOfflineReady() {
      // app shell fully cached — safe to use offline
    },
  });
  return updateSW;
}
