import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const APP_VERSION = "2.0.0 Beta";

export default function AboutDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-background/95 backdrop-blur-md border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-primary mb-4">ABOUT NAD RACER</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Learn more about this 3D space racing experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Game Info Card */}
          <Card className="bg-gradient-to-br from-background/90 via-background/85 to-background/80 backdrop-blur-md border-primary/40 shadow-[0_0_25px_hsl(var(--primary)/0.15)] relative overflow-hidden">
            {/* Subtle animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse"></div>
            
            <CardContent className="p-6 relative space-y-4">
              {/* Game Title & Version */}
              <div className="text-center">
                <h3 className="text-3xl font-bold text-primary mb-2 font-orbitron">NAD RACER</h3>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  Version {APP_VERSION}
                </Badge>
              </div>

              {/* Description */}
              <div className="text-center space-y-3">
                <p className="text-foreground leading-relaxed">
                  Experience the thrill of high-speed space racing in this immersive 3D game. 
                  Navigate through challenging courses, collect coins, and avoid obstacles while 
                  competing for the top spot on the blockchain leaderboard.
                </p>
              </div>

              {/* Credits */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <h4 className="text-lg font-semibold text-primary text-center">Credits</h4>
                <div className="text-center space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Developed By</p>
                    <p className="text-lg font-bold text-foreground">HABIBUR</p>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      onClick={() => window.open('https://x.com/meefury', '_blank', 'noopener,noreferrer')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Follow on X
                    </button>
                  </div>
                </div>
              </div>

              {/* Copyright */}
              <div className="text-center pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  © 2025 NAD RACER. All rights reserved.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}