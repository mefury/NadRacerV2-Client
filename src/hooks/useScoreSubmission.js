import { useEffect, useRef, useState } from 'react';
import { submitPlayerScore, getQueueItemStatus } from '@/backendService.js';

// Handles score submission when game ends and polls for queued submission completion
export function useScoreSubmission({
  gameState,
  monadWalletAddress,
  score,
  gameSessionId,
  onLeaderboardRefresh,
}) {
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmissionStatus, setScoreSubmissionStatus] = useState(null); // null | 'success' | 'error'
  const [scoreSubmissionMessage, setScoreSubmissionMessage] = useState('');

  // Helper to reset state (e.g., when resetting game)
  const resetSubmission = () => {
    setSubmittingScore(false);
    setScoreSubmissionStatus(null);
    setScoreSubmissionMessage('');
  };

  useEffect(() => {
    const warnedRef = { current: false };
    const submitScoreOnGameOver = async () => {
      if (gameState === 'gameover' && monadWalletAddress && score > 0 && !submittingScore && scoreSubmissionStatus === null) {
        console.log('🎮 Game over detected - submitting score to blockchain');
        setSubmittingScore(true);
        setScoreSubmissionStatus(null);

        try {
          console.log('🚀 Submitting score to blockchain:', { playerAddress: monadWalletAddress, score, sessionId: gameSessionId });
          const result = await submitPlayerScore(monadWalletAddress, score, gameSessionId, 1);
          console.log('✅ Score submission result:', result);
          console.log('📋 Transaction hash in result:', result?.transactionHash);

          if (result && result.success) {
            if (result.queued) {
              // Score was queued for processing
              setScoreSubmissionStatus('success');
              if (result.transactionHash) {
                console.log('🎉 Transaction hash available immediately:', result.transactionHash);
                setScoreSubmissionMessage(`Score submitted! 🎉 TX: ${result.transactionHash.slice(0, 10)}...${result.transactionHash.slice(-8)}`);
                return; // Don't start polling if we already have the hash
              } else {
                setScoreSubmissionMessage('Score queued for submission! 📋 Processing...');
              }

              // Poll for completion status using queue item status
              const pollForCompletion = async (queueId, attempts = 0) => {
                if (attempts >= 15) { // Stop polling after ~15 seconds
                  setScoreSubmissionMessage('Score submission completed successfully!');
                  return;
                }

                try {
                  const queueStatus = await getQueueItemStatus(queueId);

                  if (import.meta.env.DEV) {
                    console.debug('🔍 Queue polling check', {
                      queueId,
                      status: queueStatus.status,
                      transactionHash: queueStatus.transactionHash,
                      attempts: attempts + 1,
                    });
                  }

                  if (queueStatus?.notFound) {
                    // Stop polling silently on 404s
                    return;
                  }

                  if (queueStatus.success && queueStatus.transactionHash) {
                    console.log('✅ Transaction hash found in queue!');
                    setScoreSubmissionMessage(`Score submitted! 🎉 TX: ${queueStatus.transactionHash.slice(0, 10)}...${queueStatus.transactionHash.slice(-8)}`);
                    return;
                  }

                  if (queueStatus.status === 'completed') {
                    console.log('✅ Queue item completed');
                    setScoreSubmissionMessage('Score submitted to blockchain! 🎉');
                    return;
                  }

                  setTimeout(() => pollForCompletion(queueId, attempts + 1), 1000);
                } catch (error) {
                  if (!warnedRef.current && import.meta.env.DEV) {
                    console.warn('Error polling queue status:', error.message);
                    warnedRef.current = true;
                  }
                  setTimeout(() => pollForCompletion(queueId, attempts + 1), 1000);
                }
              };

              // Start polling after a short delay
              if (result.queueId) setTimeout(() => pollForCompletion(result.queueId), 1000);
            } else {
              // Score processed immediately
              setScoreSubmissionStatus('success');
              if (result.transactionHash) {
                setScoreSubmissionMessage(`Score submitted! 🎉 TX: ${result.transactionHash.slice(0, 10)}...${result.transactionHash.slice(-8)}`);
              } else {
                setScoreSubmissionMessage('Score submitted to blockchain! 🎉');
              }

              // Refresh leaderboard after delay
              setTimeout(async () => {
                try {
                  await onLeaderboardRefresh?.();
                } catch (error) {
                  console.warn('Failed to refresh leaderboard after submission:', error.message);
                }
              }, 5000);
            }
          } else {
            setScoreSubmissionStatus('error');
            setScoreSubmissionMessage(result?.message || 'Failed to submit score');
          }
        } catch (error) {
          console.error('❌ Score submission error:', error);
          setScoreSubmissionStatus('error');
          setScoreSubmissionMessage('Network error - score not submitted');
        } finally {
          setSubmittingScore(false);
        }
      }
    };

    submitScoreOnGameOver();
  }, [gameState, monadWalletAddress, score, gameSessionId, submittingScore, scoreSubmissionStatus, onLeaderboardRefresh]);

  return {
    submittingScore,
    scoreSubmissionStatus,
    scoreSubmissionMessage,
    resetSubmission,
  };
}
