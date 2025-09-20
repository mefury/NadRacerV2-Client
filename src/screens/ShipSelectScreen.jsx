import React from 'react';
import ShipPreview from '@/ShipPreview.jsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

function ShipSelectScreen({ shipOptions, selectedShip, onSelect, onLaunch, onBack }) {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8 relative">
            {/* Back Button - Above Title */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12">
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="bg-background/80 backdrop-blur-sm border-primary/50 text-primary hover:bg-primary/10 hover:border-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)] transition-all duration-300 w-10 h-10 p-0"
                aria-label="Go back to home"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </div>

            <h1 className="text-4xl md:text-6xl text-primary font-bold mb-4">SELECT YOUR SHIP</h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {shipOptions.map((ship) => (
              <Card
                key={ship.id}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  selectedShip === ship.id
                    ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.6)] bg-primary/5'
                    : 'border-primary/30 hover:border-primary/60 bg-transparent'
                }`}
                onClick={() => onSelect(ship.id)}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-full h-32 mb-4 bg-muted/30 rounded-lg flex items-center justify-center">
                      <ShipPreview shipId={ship.id} className="w-full h-full" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{ship.name}</h3>
                    <p className="text-white/80 text-sm">
                      {ship.id === 'SHIP_1' ? 'Sleek and aerodynamic design' : 'Rugged and distinctive styling'}
                    </p>
                    {selectedShip === ship.id && (
                      <Badge className="mt-3 bg-primary text-primary-foreground">SELECTED</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={onLaunch}
              size="lg"
              className="h-16 md:h-20 text-lg md:text-2xl px-8 md:px-12 bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/50 text-white shadow-[0_0_20px_hsl(var(--primary)/0.4)] focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Start the NAD RACER mission"
            >
              <span className="flex items-center gap-2 md:gap-4 font-bold tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <img src="/svg/play.svg" alt="Play" className="w-6 h-6 md:w-8 md:h-8" />
                <span className="hidden sm:inline">LAUNCH MISSION</span>
                <span className="sm:hidden">LAUNCH</span>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-pulse shadow-[0_0_6px_hsl(var(--primary)/0.8)]" aria-hidden="true"></div>
              </span>
            </Button>
            <p className="text-white/70 text-sm mt-4">All ships have identical performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShipSelectScreen;
