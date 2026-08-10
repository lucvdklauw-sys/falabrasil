// Stub for the standalone single-file preview build, which has no service
// worker. Keeps src/pwa.ts working without the real vite-plugin-pwa virtual module.
export function registerSW() {
  return () => Promise.resolve();
}
