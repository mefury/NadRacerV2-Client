import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { startGameSession } from '@/backendService.js';

// Provides gameSessionId and a function to start a new session for a wallet
export function useGameSession() {
  const [gameSessionId, setGameSessionId] = useState(null);
  const { getAccessToken } = usePrivy();

  const startSession = async (monadWalletAddress) => {
    if (!monadWalletAddress) return null;
    try {
      const accessToken = await getAccessToken();
      const { sessionId, sessionSalt } = await startGameSession(monadWalletAddress, accessToken);
      setGameSessionId(sessionId);
      console.log('🎮 Game session created:', sessionId, 'with salt');
      return sessionId;
    } catch (sessionError) {
      console.error('⚠️ Failed to create game session:', sessionError);
      return null;
    }
  };

  return { gameSessionId, startSession };
}
