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
      <Card className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.25)] z-10 select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}>
        <CardContent className="p-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl md:text-5xl text-red-500 font-bold font-mono drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
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
              <p className="text-xs uppercase text-white font-semibold">HEALTH</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FPS Counter */}
      <Badge
        variant="outline"
        className="absolute top-36 left-4 text-xs text-white border-red-500/30 bg-black/60 backdrop-blur-md drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] select-none"
        style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
      >
        FPS: {fps}
      </Badge>

      {/* Mobile Controls */}
      <div className="fixed left-1/2 transform -translate-x-1/2 z-50 flex justify-between w-11/12 max-w-md md:hidden gap-3 sm:gap-4 select-none" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', WebkitUserSelect: 'none', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}>
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary/50 bg-transparent shadow-[0_0_10px_hsl(var(--primary)/0.3)] hover:bg-primary/10 active:bg-primary/20 p-0"
            style={{ touchAction: 'manipulation', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
            onContextMenu={(e) => e.preventDefault()}
            onTouchStart={(e) => { e.preventDefault(); controlsRef.current.left = true; }}
            onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.left = false; }}
            aria-label="Move left"
          >
            <img src="/svg/left.svg" alt="" draggable="false" onDragStart={(e)=>e.preventDefault()} onContextMenu={(e)=>e.preventDefault()} className="w-12 h-12 sm:w-16 sm:h-16 select-none pointer-events-none" style={{ WebkitTouchCallout: 'none', WebkitUserDrag: 'none', WebkitUserSelect: 'none', userSelect: 'none' }} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary/50 bg-transparent shadow-[0_0_10px_hsl(var(--primary)/0.3)] hover:bg-primary/10 active:bg-primary/20 p-0"
            style={{ touchAction: 'manipulation', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
            onContextMenu={(e) => e.preventDefault()}
            onTouchStart={(e) => { e.preventDefault(); controlsRef.current.boost = true; }}
            onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.boost = false; }}
            aria-label="Boost"
          >
            <img src="/svg/fire.svg" alt="" draggable="false" onDragStart={(e)=>e.preventDefault()} onContextMenu={(e)=>e.preventDefault()} className="w-12 h-12 sm:w-16 sm:h-16 select-none pointer-events-none" style={{ WebkitTouchCallout: 'none', WebkitUserDrag: 'none', WebkitUserSelect: 'none', userSelect: 'none' }} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary/50 bg-transparent shadow-[0_0_10px_hsl(var(--primary)/0.3)] hover:bg-primary/10 active:bg-primary/20 p-0"
            style={{ touchAction: 'manipulation', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
            onContextMenu={(e) => e.preventDefault()}
            onTouchStart={(e) => { e.preventDefault(); controlsRef.current.right = true; }}
            onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.right = false; }}
            aria-label="Move right"
          >
            <img src="/svg/right.svg" alt="" draggable="false" onDragStart={(e)=>e.preventDefault()} onContextMenu={(e)=>e.preventDefault()} className="w-12 h-12 sm:w-16 sm:h-16 select-none pointer-events-none" style={{ WebkitTouchCallout: 'none', WebkitUserDrag: 'none', WebkitUserSelect: 'none', userSelect: 'none' }} />
          </Button>
      </div>
    </>
  );
}

export default PlayingHud;
