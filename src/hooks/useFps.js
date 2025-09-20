import { useEffect, useRef } from 'react';

// useFps: updates provided setFps callback while enabled is true
export function useFps(enabled, setFps) {
  const fpsRef = useRef({ frames: 0, lastTime: performance.now(), rafId: null });

  useEffect(() => {
    if (!enabled) return;

    const loop = () => {
      const now = performance.now();
      const delta = now - fpsRef.current.lastTime;
      fpsRef.current.frames++;

      if (delta >= 1000) {
        setFps(Math.round((fpsRef.current.frames * 1000) / delta));
        fpsRef.current.frames = 0;
        fpsRef.current.lastTime = now;
      }

      fpsRef.current.rafId = requestAnimationFrame(loop);
    };

    fpsRef.current.lastTime = performance.now();
    fpsRef.current.frames = 0;
    fpsRef.current.rafId = requestAnimationFrame(loop);

    return () => {
      if (fpsRef.current.rafId) cancelAnimationFrame(fpsRef.current.rafId);
      fpsRef.current.rafId = null;
    };
  }, [enabled, setFps]);
}
