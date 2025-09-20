import React from 'react';
import BackgroundScene from '@/background.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function StartScreen({ appVersion, onStart }) {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <BackgroundScene />

      <div className="absolute inset-0 flex flex-col items-center justify-start z-10 p-6 pt-20">
        <div className="max-w-2xl w-full text-center">
          {/* Game Title */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <Badge
                variant="outline"
                className="bg-background/80 backdrop-blur-sm border-primary/30 text-muted-foreground text-xs"
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

          {/* Main Play Button - Center */}
          <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-10">
            <Button
              onClick={onStart}
              size="lg"
              className="h-20 text-2xl px-12 bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/50 text-white shadow-[0_0_20px_hsl(var(--primary)/0.4)] focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Start the NAD RACER game"
            >
              <span
                className="flex items-center gap-4 font-bold tracking-wider"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                <img src="/svg/play.svg" alt="Play" className="w-8 h-8" />
                LAUNCH
                <div
                  className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_6px_hsl(var(--primary)/0.8)]"
                  aria-hidden="true"
                ></div>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartScreen;
