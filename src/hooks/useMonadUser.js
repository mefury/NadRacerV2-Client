import { useEffect, useState } from 'react';
import { getMonadUsername, getBlockchainPlayerData } from '@/backendService.js';

export function useMonadUser(user) {
  const [monadWalletAddress, setMonadWalletAddress] = useState(null);
  const [monadUsername, setMonadUsername] = useState('Loading...');
  const [hasUsername, setHasUsername] = useState(false);
  const [blockchainHighScore, setBlockchainHighScore] = useState(0);
  const [loadingScore, setLoadingScore] = useState(false);

  // Extract Monad wallet address from cross-app account
  useEffect(() => {
    if (user?.linkedAccounts?.length > 0) {
      const crossAppAccount = user.linkedAccounts.find(
        (account) =>
          account.type === 'cross_app' && account.providerApp?.id === import.meta.env.VITE_MONAD_APP_ID
      );

      if (crossAppAccount?.embeddedWallets?.length > 0) {
        const walletIndex = crossAppAccount.embeddedWallets.length > 1 ? 1 : 0;
        const walletAddress = crossAppAccount.embeddedWallets[walletIndex].address;
        setMonadWalletAddress(walletAddress);
      }
    } else {
      setMonadWalletAddress(null);
    }
  }, [user]);

  // Fetch player data when wallet address changes
  useEffect(() => {
    const fetchPlayerData = async () => {
      if (monadWalletAddress) {
        try {
          const username = await getMonadUsername(monadWalletAddress);
          if (username === 'No Username') {
            setMonadUsername('Pilot');
            setHasUsername(false);
          } else if (username && username !== 'Pilot') {
            setMonadUsername(username);
            setHasUsername(true);
          } else {
            setMonadUsername('Pilot');
            setHasUsername(false);
          }

          setLoadingScore(true);
          const playerData = await getBlockchainPlayerData(monadWalletAddress);
          setBlockchainHighScore(playerData.gameScore || 0);
          setLoadingScore(false);
        } catch (error) {
          console.error('Failed to fetch player data:', error);
          setMonadUsername('Pilot');
          setBlockchainHighScore(0);
          setLoadingScore(false);
        }
      } else {
        setMonadUsername('Pilot');
        setHasUsername(false);
        setBlockchainHighScore(0);
        setLoadingScore(false);
      }
    };

    fetchPlayerData();
  }, [monadWalletAddress]);

  return {
    monadWalletAddress,
    monadUsername,
    hasUsername,
    blockchainHighScore,
    loadingScore,
  };
}
