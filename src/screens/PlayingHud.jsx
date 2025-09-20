import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function getHealthColor(health, i) {
  if (health === 3) return 'bg-success';
  if (health === 2) return 'bg-warning';
  return 'bg-error';
}

function PlayingHud({ score, health, fps, controlsRef }) {
  return (
    <>
      {/* Game HUD */}
      <Card className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.2)] z-10">
        <CardContent className="p-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl md:text-5xl text-primary font-bold font-mono">
                {score.toLocaleString()}
              </div>
              <p className="text-xs uppercase text-muted-foreground mt-1">SCORE</p>
            </div>
            <div className="text-center">
              <div className="flex gap-1 mb-2 justify-center">
                {Array(9).fill().map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-6 rounded-full transition-colors duration-200 ${
                      i < health * 3 ? getHealthColor(health, i) : 'bg-muted'
                    }`}
                  ></div>
                ))}
              </div>
              <p className="text-xs uppercase text-foreground font-semibold">HEALTH</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FPS Counter */}
      <Badge
        variant="outline"
        className="absolute top-36 left-4 text-xs text-foreground border-primary/30 bg-background/80 backdrop-blur-sm"
      >
        FPS: {fps}
      </Badge>

      {/* Mobile Controls */}
      <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 flex justify-between w-11/12 max-w-md md:hidden gap-4">
        <Button
          variant="outline"
          size="lg"
          className="w-20 h-20 rounded-full border-2 border-primary/50 bg-transparent shadow-[0_0_10px_hsl(var(--primary)/0.3)] hover:bg-primary/10 active:bg-primary/20 p-0"
          onTouchStart={(e) => { e.preventDefault(); controlsRef.current.left = true; }}
          onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.left = false; }}
          aria-label="Move left"
        >
          <img src="/svg/left.svg" alt="Left" className="w-20 h-20" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-20 h-20 rounded-full border-2 border-primary/50 bg-transparent shadow-[0_0_10px_hsl(var(--primary)/0.3)] hover:bg-primary/10 active:bg-primary/20 p-0"
          onTouchStart={(e) => { e.preventDefault(); controlsRef.current.boost = true; }}
          onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.boost = false; }}
          aria-label="Boost"
        >
          <img src="/svg/fire.svg" alt="Boost" className="w-20 h-20" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-20 h-20 rounded-full border-2 border-primary/50 bg-transparent shadow-[0_0_10px_hsl(var(--primary)/0.3)] hover:bg-primary/10 active:bg-primary/20 p-0"
          onTouchStart={(e) => { e.preventDefault(); controlsRef.current.right = true; }}
          onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.right = false; }}
          aria-label="Move right"
        >
          <img src="/svg/right.svg" alt="Right" className="w-20 h-20" />
        </Button>
      </div>
    </>
  );
}

export default PlayingHud;
