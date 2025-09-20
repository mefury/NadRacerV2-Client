import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function LeaderboardDialog({ 
  open, 
  onOpenChange, 
  leaderboard = [], 
  leaderboardLoading = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-black/90 backdrop-blur-md border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center text-primary mb-4">🏆 TOP PILOTS</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            View the highest scoring pilots in NAD RACER
          </DialogDescription>
        </DialogHeader>

        {leaderboardLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
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
                      {index === 0 && <span className="mr-3 text-2xl">🥇</span>}
                      {index === 1 && <span className="mr-3 text-2xl">🥈</span>}
                      {index === 2 && <span className="mr-3 text-2xl">🥉</span>}
                      <span className="text-xl font-bold text-primary">{index + 1}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-lg font-semibold text-foreground">{entry.username}</span>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <span className="text-xl font-mono font-bold text-primary">{entry.score.toLocaleString()}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-primary mb-3">COMING SOON</h3>
            <p className="text-muted-foreground text-sm">Blockchain rankings and competitive gameplay coming soon!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
