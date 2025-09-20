// Monad Game ID backend service
// Integrates with Monad Game ID APIs for leaderboard and score management








// Get Monad username from wallet address
export const getMonadUsername = async (walletAddress) => {
  try {
    console.log('🎮 Fetching Monad username for wallet:', walletAddress);

    // Validate wallet address format
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      console.error('❌ Invalid wallet address format:', walletAddress);
      return 'Pilot';
    }

    // Try direct API call first (bypass proxy for debugging)
    const directUrl = `${import.meta.env.VITE_MONAD_USERNAME_API}/api/check-wallet?wallet=${walletAddress}`;
    console.log('🎮 Direct API URL:', directUrl);

    let response;
    let data;

    try {
      // Try direct call first
      response = await fetch(directUrl);
      console.log('🎮 Direct API Response status:', response.status);

      if (response.ok) {
        data = await response.json();
        console.log('🎮 Direct API response received');
      } else {
        throw new Error(`Direct API failed with status ${response.status}`);
      }
    } catch (directError) {
      console.log('⚠️ Direct API failed, trying proxy:', directError.message);

      // Fallback to proxy
      const proxyUrl = `/api/monad/api/check-wallet?wallet=${walletAddress}`;
      console.log('🎮 Proxy API URL:', proxyUrl);

      response = await fetch(proxyUrl);
      console.log('🎮 Proxy API Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Proxy API failed with status ${response.status}`);
      }

      data = await response.json();
      console.log('🎮 Proxy API response received');
    }

    console.log('🎮 Raw API response:', data);
    console.log('🎮 Response hasUsername:', data.hasUsername);
    console.log('🎮 Response user:', data.user);
    console.log('🎮 Response user.username:', data.user?.username);

    // Check if user has a username
    if (data.hasUsername && data.user?.username) {
      console.log('✅ Returning username:', data.user.username);
      return data.user.username;
    } else {
      console.log('⚠️ User does not have a username yet');
      return 'No Username'; // Special case for users without username
    }
  } catch (error) {
    console.error('❌ Error fetching Monad username:', error);
    console.error('❌ Error details:', error.message);

    // Try one more time with a simple fetch to check connectivity
    try {
      console.log('🔄 Testing API connectivity...');
      const testResponse = await fetch(`${import.meta.env.VITE_MONAD_USERNAME_API}/api/health`);
      console.log('🔄 API connectivity test:', testResponse.status);
    } catch (connectError) {
      console.error('🔄 API connectivity test failed:', connectError.message);
    }

    // If we get here, both direct and proxy calls failed
    console.log('⚠️ Both API calls failed, using fallback mechanism');
    return await getMonadUsernameFallback(walletAddress);
  }
};

// Fallback function that doesn't rely on external API
export const getMonadUsernameFallback = async (walletAddress) => {
  try {
    console.log('🔄 FALLBACK: Using local username detection for:', walletAddress);

    // For now, just return a generic pilot name
    // In the future, this could check local storage or a cached list
    const fallbackUsername = `Pilot_${walletAddress.slice(-4)}`;
    console.log('🔄 FALLBACK: Generated username:', fallbackUsername);

    return fallbackUsername;
  } catch (error) {
    console.error('🔄 FALLBACK: Error in fallback function:', error);
    return 'Pilot';
  }
};

// API base URL configuration
// Priority:
// 1) VITE_API_BASE_URL (explicit)
// 2) localhost:3001 in dev
// 3) empty string for same-origin requests in prod
const API_BASE_URL = (() => {
  const fromEnv = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://localhost:3001';
  return '';
})();

// Debug logging for API base URL
console.log('🔧 API_BASE_URL:', API_BASE_URL);
console.log('🔧 Current hostname:', typeof window !== 'undefined' ? window.location.hostname : 'n/a');
console.log('🔧 DEV mode:', import.meta.env.DEV);

/**
 * Start a game session for anti-cheat protection
 */
export const startGameSession = async (playerAddress) => {
  try {
    console.log('🎮 Starting game session for:', playerAddress);

const response = await fetch(`${API_BASE_URL}/api/start-game`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_KEY || 'nad-racer-secret-key-2024',
      },
      body: JSON.stringify({
        playerAddress
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Game session started:', data.sessionId);
      return data.sessionId;
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to start game session:', errorData);
      throw new Error(errorData.error || 'Failed to start game session');
    }
  } catch (error) {
    console.error('❌ Error starting game session:', error);
    throw error;
  }
};

/**
 * Submit player score to the blockchain via backend
 */
export const submitPlayerScore = async (playerAddress, score, sessionId, transactions = 1) => {
  try {
    console.log('📤 Submitting score to backend:', { playerAddress, score, sessionId, transactions });

const response = await fetch(`${API_BASE_URL}/api/submit-score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_API_KEY || 'nad-racer-secret-key-2024', // Fallback for development
      },
      body: JSON.stringify({
        playerAddress,
        score,
        sessionId,
        transactions
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Score submitted successfully:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to submit score:', errorData);
      throw new Error(errorData.error || 'Failed to submit score');
    }
  } catch (error) {
    console.error('❌ Error submitting score:', error);
    throw error;
  }
};

// Cache for leaderboard data to prevent excessive API calls
let leaderboardCache = null;
let lastLeaderboardFetch = 0;
const LEADERBOARD_CACHE_DURATION = 30000; // 30 seconds


// Function to clear leaderboard cache (useful for manual refresh)
export const clearLeaderboardCache = () => {
  leaderboardCache = null;
  lastLeaderboardFetch = 0;
  console.log('🧹 Leaderboard cache cleared - will fetch fresh data on next request');
};

/**
 * Get leaderboard data from official Monad API
 * Returns accumulated total scores for all players
 */
export const getBlockchainLeaderboard = async (limit = 20) => {
  try {
    const now = Date.now();

    // Return cached data if it's still fresh
    if (leaderboardCache && (now - lastLeaderboardFetch) < LEADERBOARD_CACHE_DURATION) {
      console.log('📊 Using cached leaderboard data');
      return leaderboardCache;
    }

    // Use backend proxy to avoid CORS issues
    const gameId = import.meta.env.VITE_LEADERBOARD_GAME_ID || 21;
const apiUrl = `${API_BASE_URL}/api/proxy/leaderboard?gameId=${gameId}`;

    const response = await fetch(apiUrl);

    if (response.ok) {
      const data = await response.json();

      // Process API data with validation - these are accumulated total scores
      let leaderboard = [];

      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        // API returned data, process it
        console.log(`📊 Processing ${data.data.length} leaderboard entries from API`);
        for (const entry of data.data) {
          const totalScore = typeof entry.score === 'number' ? entry.score : parseInt(entry.score) || 0;

          leaderboard.push({
            address: entry.walletAddress,
            score: totalScore,              // Accumulated total score
            username: entry.username || `Pilot ${leaderboard.length + 1}`, // Player name from API
            highestScore: totalScore        // For compatibility - now represents total
          });
        }
      } else {
        // API returned empty data - no scores submitted yet
        console.log('📊 No leaderboard data available - no scores have been submitted yet');
        leaderboard = []; // Return empty array
      }

      // Sort by score descending and limit results
      const sortedLeaderboard = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // Cache the result
      leaderboardCache = sortedLeaderboard;
      lastLeaderboardFetch = now;

      return sortedLeaderboard;
    } else {
      console.warn('⚠️ Failed to fetch leaderboard from Monad API');
      // Return empty array instead of cached data to show current state
      return [];
    }
  } catch (error) {
    console.warn('⚠️ Error fetching leaderboard:', error.message);
    // Return empty array instead of cached data to show current state
    return [];
  }
};

/**
 * Get player data from backend
 */
export const getBlockchainPlayerData = async (playerAddress) => {
  try {
    console.log('👤 Fetching blockchain player data for:', playerAddress);

const response = await fetch(`${API_BASE_URL}/api/player/${playerAddress}`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Blockchain player data fetched:', data);
      return data;
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to fetch blockchain player data:', errorData);
      throw new Error(errorData.error || 'Failed to fetch player data');
    }
  } catch (error) {
    console.error('❌ Error fetching blockchain player data:', error);
    throw error;
  }
};

/**
 * Get queue item status for submitted score (polling helper)
 */
export const getQueueItemStatus = async (queueId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/queue/item/${queueId}`);
    if (response.status === 404) {
      // Not found - stop polling silently
      return { notFound: true };
    }
    if (!response.ok) {
      throw new Error(`Queue status failed: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('⚠️ Error fetching queue item status:', error.message);
    }
    throw error;
  }
};

