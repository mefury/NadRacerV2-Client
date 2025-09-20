import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function GameOverOverlay({
  score,
  submittingScore,
  scoreSubmissionStatus,
  scoreSubmissionMessage,
  onPlayAgain,
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <Card className="relative max-w-md w-full bg-black/90 border border-primary/40 shadow-[0_0_30px_hsl(var(--primary)/0.25)] overflow-hidden">
        {/* Animated accent lines */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
        <CardHeader className="text-center">
          <CardTitle className="text-3xl tracking-wider text-primary drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]">GAME OVER</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg border border-primary/40 bg-primary/5 shadow-[0_0_15px_hsl(var(--primary)/0.15)]">
              <span className="text-sm text-muted-foreground tracking-widest">SCORE</span>
              <span className="text-3xl font-mono font-bold text-primary">{score.toLocaleString()}</span>
            </div>
          </div>

          {submittingScore && (
            <div className="text-center py-2">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {scoreSubmissionStatus && !submittingScore && (
            <div className={`text-center py-3 px-4 rounded-lg border ${
              scoreSubmissionStatus === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <p className="text-sm font-medium">{scoreSubmissionMessage}</p>
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={onPlayAgain}
              size="lg"
              className="h-20 text-2xl px-12 w-full bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/50 text-white shadow-[0_0_20px_hsl(var(--primary)/0.4)] focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Play again"
            >
              <span className="flex items-center justify-center gap-4 font-bold tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <img src="/svg/play.svg" alt="Play" className="w-8 h-8" />
                PLAY AGAIN
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_6px_hsl(var(--primary)/0.8)]" aria-hidden="true"></div>
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GameOverOverlay;
