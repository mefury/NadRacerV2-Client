import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

function GameOverScreen({
  score,
  collectedCoins,
  submittingScore,
  scoreSubmissionStatus,
  scoreSubmissionMessage,
  onPlayAgain,
  leaderboard,
  leaderboardLoading,
}) {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6">
        <Card className="max-w-md w-full bg-background/90 backdrop-blur-sm border-primary/30">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-primary mb-2">GAME OVER</CardTitle>
            <p className="text-muted-foreground">Mission Complete</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary mb-2">SCORE: {score.toLocaleString()}</p>
              <p className="text-foreground/90">Coins Collected: {collectedCoins}</p>
            </div>

            {/* Score Submission Status */}
            {submittingScore && (
              <div className="text-center py-4">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-foreground/90 text-sm">Submitting score to blockchain...</p>
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

            <div className="space-y-3">
              <Button onClick={onPlayAgain} className="w-full" size="lg">
                Play Again
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" size="lg">
                    View Leaderboard
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-background/95 backdrop-blur-md border-primary/30">
                  <DialogHeader>
                    <DialogTitle className="text-3xl text-center text-primary mb-4">🏆 TOP PILOTS</DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                      View the highest scoring pilots in NAD RACER
                    </DialogDescription>
                  </DialogHeader>
                  {leaderboardLoading ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                      <p className="text-foreground/90 text-lg">Loading leaderboard...</p>
                    </div>
                  ) : leaderboard.length > 0 ? (
                    <ScrollArea className="h-96 w-full">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-primary/30">
                            <TableHead className="w-20 text-primary font-bold text-lg">RANK</TableHead>
                            <TableHead className="text-primary font-bold text-lg">PILOT</TableHead>
                            <TableHead className="text-right text-primary font-bold text-lg">SCORE</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leaderboard.map((entry, index) => (
                            <TableRow key={index} className="hover:bg-primary/5 border-primary/20">
                              <TableCell className="flex items-center py-4">
                                <Badge
                                  variant={index < 3 ? 'default' : 'secondary'}
                                  className={`mr-3 ${index === 0 ? 'bg-gold' : index === 1 ? 'bg-silver' : index === 2 ? 'bg-bronze' : ''}`}
                                >
                                  {index === 0 && '🥇'}
                                  {index === 1 && '🥈'}
                                  {index === 2 && '🥉'}
                                  {index > 2 && (index + 1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                                      {entry.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-lg font-semibold text-foreground">{entry.username}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right py-4">
                                <span className="text-xl font-mono font-bold text-primary">{entry.score.toLocaleString()}</span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-foreground/80 text-lg">No scores submitted yet</p>
                      <p className="text-muted-foreground text-sm mt-2">Be the first to set a high score!</p>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GameOverScreen;
