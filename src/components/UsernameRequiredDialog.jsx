import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, User } from 'lucide-react';

export default function UsernameRequiredDialog({ open, onOpenChange }) {
  const handleCreateUsername = () => {
    window.open('https://www.monadclip.fun/', '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-md border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center text-primary mb-4 flex items-center justify-center gap-2">
            <User className="w-6 h-6" />
            USERNAME REQUIRED
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            You need a username to play NAD RACER and compete on the leaderboard
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Info Card */}
          <Card className="bg-gradient-to-br from-background/90 via-background/85 to-background/80 backdrop-blur-md border-primary/40 shadow-[0_0_25px_hsl(var(--primary)/0.15)] relative overflow-hidden">
            {/* Subtle animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-pulse"></div>
            
            <CardContent className="p-6 relative space-y-4">
              {/* Message */}
              <div className="text-center space-y-3">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-lg font-semibold text-foreground">
                  Ready to Join the Race?
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create your pilot username on MonadClip to start racing, earn scores, 
                  and compete with other pilots on the blockchain leaderboard!
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Compete on blockchain leaderboard</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Track your high scores</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>Show off your racing skills</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleCreateUsername}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Create Username on MonadClip
                </Button>
                
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>

              {/* Note */}
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  After creating your username, refresh this page to start playing
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}