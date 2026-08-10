import { useCallback, useEffect, useRef, useState } from "react";

/** Speaks Brazilian Portuguese text using the browser's speech synthesis.
 * Tries to pick a pt-BR voice specifically (not pt-PT). */
export function useTTS() {
  const [supported, setSupported] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const ptBR =
        voices.find((v) => v.lang?.toLowerCase() === "pt-br") ??
        voices.find((v) => v.lang?.toLowerCase().startsWith("pt-br")) ??
        voices.find((v) => v.lang?.toLowerCase().startsWith("pt")) ??
        null;
      voiceRef.current = ptBR;
    };

    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "pt-BR";
        if (voiceRef.current) utter.voice = voiceRef.current;
        utter.rate = 0.92;
        utter.pitch = 1;
        window.speechSynthesis.speak(utter);
      } catch {
        // ignore playback errors
      }
    },
    [supported]
  );

  return { speak, supported };
}
