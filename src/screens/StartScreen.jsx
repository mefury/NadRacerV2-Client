import React, { useRef, useState } from 'react';
import BackgroundScene from '@/background.jsx';
import { Badge } from '@/components/ui/badge';

function StartScreen({ appVersion, onStart }) {
  const bgRef = useRef(null);
  const [launching, setLaunching] = useState(false);

  const handleLaunch = () => {
    if (launching) return;
    setLaunching(true);
    if (bgRef.current && typeof bgRef.current.zoomOut === 'function') {
      bgRef.current.zoomOut(() => {
        onStart?.();
        setLaunching(false);
      }, 35, 600);
    } else {
      onStart?.();
      setLaunching(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <BackgroundScene ref={bgRef} />

      <div className="absolute inset-0 flex flex-col items-center justify-start z-10 p-6 pt-20">
        <div className="max-w-2xl w-full text-center">
          {/* Game Title */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <Badge
                variant="outline"
                className="bg-red-500/10 text-red-400 border-red-500/30 text-xs"
              >
                v{appVersion}
              </Badge>
            </div>
            <h1
              className="game-title text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider mb-4 relative"
              style={{
                background:
                  'linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--primary) / 0.3) 25%, hsl(var(--primary)) 50%, hsl(var(--primary) / 0.8) 75%, hsl(var(--foreground)) 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow:
                  `0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.2)`,
                filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.8)) brightness(1.1)',
                animation: 'shimmer 4s ease-in-out infinite'
              }}
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                  @keyframes shimmer {
                    0%, 100% {
                      background-position: 0% 50%;
                      filter: brightness(1.1) drop-shadow(0 0 10px hsl(var(--primary) / 0.8));
                    }
                    50% {
                      background-position: 100% 50%;
                      filter: brightness(1.3) drop-shadow(0 0 20px hsl(var(--primary) / 1));
                    }
                  }
                `
                }}
              />
              NAD RACER
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-6"></div>
          </div>

          {/* Launch CTA - Center text */}
          <div className="absolute inset-0 z-10 flex items-center justify-center select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
            <button
              onClick={handleLaunch}
              className="group relative text-red-500 hover:text-red-400 transition-colors cursor-pointer"
              aria-label="Launch mission"
              style={{ background: 'transparent', border: 'none' }}
            >
              <span className="hidden md:inline font-bold tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Click Here to Launch Mission
              </span>
              <span className="md:hidden inline font-bold tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Tap Here To Launch Mission
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartScreen;
