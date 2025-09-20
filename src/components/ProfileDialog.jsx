import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProfileDialog({ 
  open, 
  onOpenChange, 
  monadUsername, 
  monadWalletAddress, 
  blockchainHighScore, 
  loadingScore 
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-black/90 backdrop-blur-md border-red-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-primary mb-4">PILOT PROFILE</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Your NAD RACER pilot information and statistics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pilot Information Card */}
<Card className="bg-black/70 backdrop-blur-md border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.15)] relative overflow-hidden">
            {/* Subtle animated background effect */}
<div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10 animate-pulse"></div>
            
            <CardContent className="p-4 relative">
              {/* Pilot Name Section */}
              <div className="mb-4 text-center">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                  PILOT CALLSIGN
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {monadUsername.toUpperCase()}
                </h3>
                
                {/* Wallet Address */}
                <div className="flex justify-center">
                  <Badge variant="outline" className="bg-black/30 text-white font-mono text-xs border-red-500/30">
                    {monadWalletAddress ? `${monadWalletAddress.slice(0, 8)}...${monadWalletAddress.slice(-6)}` : 'No wallet'}
                  </Badge>
                </div>
              </div>

              {/* High Score Section */}
              <div className="text-center">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">
                  TOTAL SCORE
                </div>
<div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-500 to-red-500/80 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)] font-mono mb-2">
                  {loadingScore ? '...' : blockchainHighScore.toLocaleString()}
                </div>
              </div>

              {/* Additional Stats */}
<div className="mt-6 pt-4 border-t border-red-500/20">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                      STATUS
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                      ACTIVE
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                      RANK
                    </div>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                      PILOT
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}