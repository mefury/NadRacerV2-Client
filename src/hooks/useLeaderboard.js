import { useEffect, useState, useCallback } from 'react';
import { getBlockchainLeaderboard } from '@/backendService.js';

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const data = await getBlockchainLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { leaderboard, leaderboardLoading, refresh };
}
