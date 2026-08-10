import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { onSWUpdate, isUpdateAvailable } from "../pwa";

const DISMISS_KEY = "bp-nl:install-banner-dismissed";

export function AppBanners() {
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const online = useOnlineStatus();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");
  const [updateReady, setUpdateReady] = useState(isUpdateAvailable());

  useEffect(() => {
    const unsub = onSWUpdate(() => setUpdateReady(true));
    return unsub;
  }, []);

  const showInstall = canInstall && !installed && !dismissed;

  function dismiss() {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-3 pt-2 sm:px-0">
      <AnimatePresence>
        {!online && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="pointer-events-auto rounded-full bg-blue-950 px-4 py-1.5 text-xs font-bold text-white shadow-md"
          >
            📡 Je bent offline — geleerde woorden werken gewoon door
          </motion.div>
        )}
        {updateReady && (
          <motion.button
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onClick={() => window.location.reload()}
            className="btn-pop pointer-events-auto rounded-full bg-yellow-400 px-4 py-1.5 text-xs font-bold text-blue-950 shadow-md"
          >
            ✨ Nieuwe versie beschikbaar — tik om te vernieuwen
          </motion.button>
        )}
        {showInstall && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-4 py-2.5 shadow-lg"
          >
            <span className="text-2xl">🦜</span>
            <div className="flex-1 text-xs">
              <p className="font-bold text-blue-950">Installeer FalaBrasil</p>
              <p className="text-blue-900/50">Snelle toegang, ook offline</p>
            </div>
            <button
              onClick={promptInstall}
              className="btn-pop rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
            >
              Installeer
            </button>
            <button onClick={dismiss} aria-label="Sluiten" className="btn-pop text-blue-900/30 hover:text-blue-900/60">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
