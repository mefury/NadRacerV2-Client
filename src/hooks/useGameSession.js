import { useState } from 'react';
import { startGameSession } from '@/backendService.js';

// Provides gameSessionId and a function to start a new session for a wallet
export function useGameSession() {
  const [gameSessionId, setGameSessionId] = useState(null);

  const startSession = async (monadWalletAddress) => {
    if (!monadWalletAddress) return null;
    try {
      const sessionId = await startGameSession(monadWalletAddress);
      setGameSessionId(sessionId);
      console.log('🎮 Game session created:', sessionId);
      return sessionId;
    } catch (sessionError) {
      console.error('⚠️ Failed to create game session:', sessionError);
      return null;
    }
  };

  return { gameSessionId, startSession };
}
