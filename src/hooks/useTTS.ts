import { useCallback, useEffect, useRef, useState } from "react";

/** Speaks Brazilian Portuguese text using the browser's speech synthesis.
 * Tries to pick a pt-BR voice specifically (not pt-PT). Also supports
 * speaking an ordered sequence of sentences ("play whole story/dialogue"),
 * reporting which index is currently playing so the UI can highlight it. */
export function useTTS() {
  const [supported, setSupported] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const sequenceTokenRef = useRef(0);

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

  const stop = useCallback(() => {
    sequenceTokenRef.current++; // invalidate any in-flight sequence
    setSpeakingIndex(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!supported) return;
      try {
        sequenceTokenRef.current++; // any running sequence stops highlighting
        setSpeakingIndex(null);
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

  /** Speaks an ordered list of Portuguese sentences one after another,
   * calling back with the current index so the caller can highlight the
   * sentence being read. Cooperatively cancellable via stop(). */
  const speakSequence = useCallback(
    (texts: string[], onDone?: () => void) => {
      if (!supported || texts.length === 0) return;
      window.speechSynthesis.cancel();
      const myToken = ++sequenceTokenRef.current;

      const playAt = (i: number) => {
        if (myToken !== sequenceTokenRef.current) return; // superseded
        if (i >= texts.length) {
          setSpeakingIndex(null);
          onDone?.();
          return;
        }
        setSpeakingIndex(i);
        const utter = new SpeechSynthesisUtterance(texts[i]);
        utter.lang = "pt-BR";
        if (voiceRef.current) utter.voice = voiceRef.current;
        utter.rate = 0.92;
        utter.pitch = 1;
        utter.onend = () => {
          if (myToken !== sequenceTokenRef.current) return;
          playAt(i + 1);
        };
        utter.onerror = () => {
          if (myToken !== sequenceTokenRef.current) return;
          playAt(i + 1);
        };
        try {
          window.speechSynthesis.speak(utter);
        } catch {
          playAt(i + 1);
        }
      };

      playAt(0);
    },
    [supported]
  );

  return { speak, speakSequence, stop, supported, speakingIndex };
}
