"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives a 0–1 progress value in real time, like an <audio> element would.
 * Changing `duration` mid-play keeps the current position.
 */
export function useMockPlayback(duration: number) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const progressRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const startedAt = performance.now();
    const from = progressRef.current;

    const tick = (now: number) => {
      const next = from + (now - startedAt) / (duration * 1000);
      if (next >= 1) {
        progressRef.current = 1;
        setProgress(1);
        setPlaying(false);
        return;
      }
      progressRef.current = next;
      setProgress(next);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, duration]);

  const toggle = useCallback(() => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (progressRef.current >= 1) {
      progressRef.current = 0;
      setProgress(0);
    }
    setPlaying(true);
  }, [playing]);

  const seek = useCallback((value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    progressRef.current = clamped;
    setProgress(clamped);
  }, []);

  return { progress, playing, toggle, seek };
}
