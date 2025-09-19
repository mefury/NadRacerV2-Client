"use client";

import React, { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { usePrivy } from '@privy-io/react-auth';
import { getBlockchainLeaderboard, getMonadUsername, getBlockchainPlayerData, submitPlayerScore, startGameSession, clearLeaderboardCache } from './backendService.js';
import { audioSystem } from './audioSystem.js';
import RacingScene from './racingscene.jsx';
import BackgroundScene from './background.jsx';
import ShipPreview from './ShipPreview.jsx';
import ErrorBoundary from './ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toggle } from '@/components/ui/toggle';
import { Play, Pause, User, Trophy, Info, LogOut, ExternalLink } from 'lucide-react';
import Dock from '@/components/Dock';
import ProfileDialog from '@/components/ProfileDialog';
import LeaderboardDialog from '@/components/LeaderboardDialog';
import AboutDialog from '@/components/AboutDialog';
import UsernameRequiredDialog from '@/components/UsernameRequiredDialog';
import * as THREE from 'three';
import { CONFIG } from './racingLogic.js';
// App component for NAD RACER - Full Game with shadcn UI
const APP_VERSION = "2.0.0 Beta";

// Ship options for selection screen
const SHIP_OPTIONS = [
  { id: "SHIP_1", name: "Speeder", isFree: true },
  { id: "SHIP_2", name: "Bumble Ship", isFree: true },
];

function App() {
  const { user, logout } = usePrivy();


  const [monadWalletAddress, setMonadWalletAddress] = useState(null);
  const [gameState, setGameState] = useState("start"); // start, shipselect, playing, gameover
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [selectedShip, setSelectedShip] = useState("SHIP_1");
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [lastTxStatus, setLastTxStatus] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [fps, setFps] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState("play");

  // Player data
  const [monadUsername, setMonadUsername] = useState('Loading...');
  const [blockchainHighScore, setBlockchainHighScore] = useState(0);
  const [loadingScore, setLoadingScore] = useState(false);
  const [hasUsername, setHasUsername] = useState(false);

  // Score submission state
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmissionStatus, setScoreSubmissionStatus] = useState(null); // null, 'success', 'error'
  const [scoreSubmissionMessage, setScoreSubmissionMessage] = useState('');

  // Game session state for anti-cheat
  const [gameSessionId, setGameSessionId] = useState(null);

  // Audio toggle state
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Dialog states
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showUsernameRequired, setShowUsernameRequired] = useState(false);

  // Audio ref
  const audioRef = useRef(null);

  // Test audio file loading
  useEffect(() => {
    const testAudio = async () => {
      try {
        const response = await fetch('https://github.com/mefury/Nad-Racer/raw/80807203ebfa9e19b917c3198f6163f34c4daeb9/audiomass-output%20(1).mp3');
        console.log('Audio file fetch response:', response.status, response.ok);
        if (response.ok) {
          console.log('Audio file is accessible');
        } else {
          console.error('Audio file not accessible:', response.status);
        }
      } catch (error) {
        console.error('Error fetching audio file:', error);
      }
    };
    testAudio();

    // Check if audio element is created
    setTimeout(() => {
      console.log('Audio ref after mount:', audioRef.current);
      if (audioRef.current) {
        console.log('Audio element src:', audioRef.current.src);
        console.log('Audio element readyState:', audioRef.current.readyState);
      }
    }, 1000);
  }, []);

  // Handle first user interaction to enable audio
  useEffect(() => {
    const handleFirstInteraction = async () => {
      console.log('First user interaction detected');
      await audioSystem.handleUserInteraction();

      // Auto-play background music after first interaction
      if (audioRef.current && audioRef.current.paused) {
        try {
          console.log('Auto-playing background music after user interaction');
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            setIsAudioEnabled(true);
            console.log('Background music auto-played successfully');
          }
        } catch (error) {
          console.error('Auto-play after interaction failed:', error);
        }
      }

      // Remove all listeners after first interaction
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('mousemove', handleFirstInteraction);
    };

    // Add listeners for first user interaction
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('mousemove', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('mousemove', handleFirstInteraction);
    };
  }, []);

  // Handle audio toggle
  const handleAudioToggle = async (enabled) => {
     console.log('Audio toggle:', enabled);
     console.log('Audio ref exists:', !!audioRef.current);
     setIsAudioEnabled(enabled);
     if (audioRef.current) {
       console.log('Audio element:', audioRef.current);
       console.log('Current paused state:', audioRef.current.paused);
       try {
         if (enabled) {
           // Ensure audio context is initialized
           await audioSystem.handleUserInteraction();
           console.log('Attempting to play audio...');
           console.log('Audio src:', audioRef.current.src);
           console.log('Audio readyState:', audioRef.current.readyState);

           // Force play even if already "playing" but not actually playing
           audioRef.current.currentTime = 0; // Reset to beginning if needed
           const playPromise = audioRef.current.play();
           console.log('Play promise:', playPromise);
           await playPromise;
           console.log('Audio playing successfully');
           console.log('Final paused state:', audioRef.current.paused);
         } else {
           console.log('Pausing audio...');
           audioRef.current.pause();
           console.log('Audio paused, final state:', audioRef.current.paused);
         }
       } catch (error) {
         console.error('Audio playback error:', error);
         console.error('Error details:', error.message);
         // Reset state if playback fails
         setIsAudioEnabled(false);
       }
     } else {
       console.error('Audio ref not available');
     }
   };

  // Refs
  const controlsRef = useRef({ left: false, right: false, boost: false });
  const fpsRef = useRef({ frames: 0, lastTime: performance.now() });
  
  // Fetch leaderboard data on component mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLeaderboardLoading(true);
      try {
        const data = await getBlockchainLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        setLeaderboard([]);
      } finally {
        setLeaderboardLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Extract Monad wallet address from cross-app account
  useEffect(() => {
    if (user?.linkedAccounts?.length > 0) {
      const crossAppAccount = user.linkedAccounts.find(
        account => account.type === "cross_app" &&
        account.providerApp?.id === import.meta.env.VITE_MONAD_APP_ID
      );

      if (crossAppAccount?.embeddedWallets?.length > 0) {
        const walletIndex = crossAppAccount.embeddedWallets.length > 1 ? 1 : 0;
        const walletAddress = crossAppAccount.embeddedWallets[walletIndex].address;
        setMonadWalletAddress(walletAddress);
      }
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
      }
    };

    fetchPlayerData();
  }, [monadWalletAddress]);

  // Submit score when game ends (when gameState becomes "gameover")
  useEffect(() => {
    const submitScoreOnGameOver = async () => {
      if (gameState === "gameover" && monadWalletAddress && score > 0 && !submittingScore && scoreSubmissionStatus === null) {
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
                if (attempts >= 15) { // Stop polling after 15 seconds (15 * 1s)
                  setScoreSubmissionMessage('Score submission completed successfully!');
                  return;
                }

                try {
                  // Check queue item status for transaction hash
                  const response = await fetch(`${BACKEND_URL}/api/queue/item/${queueId}`);
                  const queueStatus = await response.json();

                  console.log('🔍 Queue polling check:', {
                    queueId,
                    status: queueStatus.status,
                    transactionHash: queueStatus.transactionHash,
                    attempts: attempts + 1
                  });

                  if (queueStatus.success && queueStatus.transactionHash) {
                    // Transaction hash is now available!
                    console.log('✅ Transaction hash found in queue!');
                    setScoreSubmissionMessage(`Score submitted! 🎉 TX: ${queueStatus.transactionHash.slice(0, 10)}...${queueStatus.transactionHash.slice(-8)}`);
                    return;
                  }

                  if (queueStatus.status === 'completed') {
                    // Queue item completed but no transaction hash (shouldn't happen)
                    console.log('✅ Queue item completed');
                    setScoreSubmissionMessage('Score submitted to blockchain! 🎉');
                    return;
                  }

                  // Continue polling
                  setTimeout(() => pollForCompletion(queueId, attempts + 1), 1000);
                } catch (error) {
                  console.warn('Error polling queue status:', error.message);
                  setTimeout(() => pollForCompletion(queueId, attempts + 1), 1000);
                }
              };

              // Start polling after a shorter delay for testing
              setTimeout(() => pollForCompletion(result.queueId), 1000);

            } else {
              // Score was processed immediately
              setScoreSubmissionStatus('success');
              if (result.transactionHash) {
                setScoreSubmissionMessage(`Score submitted! 🎉 TX: ${result.transactionHash.slice(0, 10)}...${result.transactionHash.slice(-8)}`);
              } else {
                setScoreSubmissionMessage('Score submitted to blockchain! 🎉');
              }

              // Refresh leaderboard data after successful submission (with delay to allow blockchain processing)
              setTimeout(async () => {
                try {
                  const updatedLeaderboard = await getBlockchainLeaderboard();
                  setLeaderboard(updatedLeaderboard);
                } catch (error) {
                  console.warn('Failed to refresh leaderboard after submission:', error.message);
                }
              }, 5000); // Increased delay to 5 seconds
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
  }, [gameState, monadWalletAddress, score, submittingScore, scoreSubmissionStatus]);

  // Game functions
  const startGame = () => {
    // Check if user has a username before starting the game
    if (!hasUsername) {
      setShowUsernameRequired(true);
      return;
    }
    setGameState("shipselect");
  };

  const endGame = () => {
    setGameState("gameover");
  };

  const resetGame = () => {
    setGameState("start");
    setCurrentSection("play");
    // Reset score submission status
    setSubmittingScore(false);
    setScoreSubmissionStatus(null);
    setScoreSubmissionMessage('');
    // Clear game session
    setGameSessionId(null);
    if (controlsRef.current) {
      controlsRef.current.left = false;
      controlsRef.current.right = false;
      controlsRef.current.boost = false;
    }
  };

  const handleShipSelect = async (shipId) => {
    try {
      // Ensure audio system is initialized on user interaction
      await audioSystem.handleUserInteraction();
      // Force initialization if not already done
      if (!audioSystem.initialized) {
        await audioSystem.init();
      }
      console.log('🎵 Audio system ready after ship selection');
    } catch (error) {
      console.error('❌ Error initializing audio system:', error);
    }
    setSelectedShip(shipId);
  };

  const startPlaying = async () => {
    try {
      setIsLoading(true);
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Ensure audio system is ready before starting the game
      try {
        await audioSystem.handleUserInteraction();
        if (!audioSystem.initialized) {
          console.log('🎵 Initializing audio system before game start...');
          await audioSystem.init();
        }
        console.log('🎵 Audio system confirmed ready for gameplay');
      } catch (audioError) {
        console.error('❌ Audio initialization error:', audioError);
        // Continue with game even if audio fails
      }

      // ANTI-CHEAT: Start game session
      if (monadWalletAddress) {
        try {
          const sessionId = await startGameSession(monadWalletAddress);
          setGameSessionId(sessionId);
          console.log('🎮 Game session created:', sessionId);
        } catch (sessionError) {
          console.error('⚠️ Failed to create game session:', sessionError);
          // Continue anyway - don't block gameplay for session creation failure
        }
      }

      setScore(0);
      setHealth(3);
      setCollectedCoins(0);
      // Reset score submission status for new game
      setSubmittingScore(false);
      setScoreSubmissionStatus(null);
      setScoreSubmissionMessage('');

      if (controlsRef.current) {
        controlsRef.current.left = false;
        controlsRef.current.right = false;
        controlsRef.current.boost = false;
      }

      setTimeout(() => {
        setIsLoading(false);
        setGameState("playing");
      }, 500);
    } catch (error) {
      console.error('❌ Error starting game:', error);
      setIsLoading(false);
      setGameState("playing");
    }
  };

  const handleGameCoinCollection = async (coinValue) => {
    setCollectedCoins(prevCoins => prevCoins + coinValue);
    audioSystem.playCoinSound();
  };

  const handleObstacleHit = () => {
    audioSystem.playCrashSound();
  };

  const getHealthColor = (health) => {
    if (health === 3) return "bg-success";
    if (health === 2) return "bg-warning";
    return "bg-error";
  };

  // Dock items configuration - using useMemo to avoid recreation on every render
  const dockItems = useMemo(() => [
    {
      icon: <User size={18} className="text-blue-500" />,
      label: "Profile",
      onClick: () => {
        setShowProfile(true);
      }
    },
    {
      icon: <Trophy size={18} className="text-yellow-500" />,
      label: "Leaderboard",
      onClick: () => {
        setShowLeaderboard(true);
      }
    },
    {
      icon: <Info size={18} className="text-blue-500" />,
      label: "About",
      onClick: () => {
        setShowAbout(true);
      }
    },
    {
      icon: isAudioEnabled ? 
        <Pause size={18} className="text-purple-500" /> : 
        <Play size={18} className="text-green-500" />,
      label: isAudioEnabled ? "Pause Audio" : "Play Audio",
      onClick: () => handleAudioToggle(!isAudioEnabled)
    },
    {
      icon: <LogOut size={18} className="text-red-500" />,
      label: "Logout",
      onClick: logout
    }
  ], [isAudioEnabled, handleAudioToggle, logout]);

  // FPS tracking
  const updateFps = useCallback(() => {
    const now = performance.now();
    const delta = now - fpsRef.current.lastTime;

    fpsRef.current.frames++;

    if (delta >= 1000) {
      setFps(Math.round((fpsRef.current.frames * 1000) / delta));
      fpsRef.current.frames = 0;
      fpsRef.current.lastTime = now;
    }
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;

    let animationFrameId;
    const frameLoop = () => {
      updateFps();
      animationFrameId = requestAnimationFrame(frameLoop);
    };

    animationFrameId = requestAnimationFrame(frameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, updateFps]);

  // Audio management
  useEffect(() => {
    const handleGameAudio = async () => {
      if (gameState === "playing") {
        try {
          // Ensure audio system is fully initialized
          await audioSystem.handleUserInteraction();
          if (!audioSystem.initialized) {
            console.log('🎵 Audio system not initialized, initializing now...');
            await audioSystem.init();
          }
          
          // Ensure audio context is running
          if (audioSystem.audioContext?.state === 'suspended') {
            console.log('🎵 Resuming suspended audio context...');
            await audioSystem.audioContext.resume();
          }
          
          // Start game audio
          console.log('🎵 Starting game audio (BGM and engine)...');
          audioSystem.startBackgroundMusic();
          audioSystem.startEngineSound();
          
          // Pause background audio when entering game
          if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsAudioEnabled(false);
          }
        } catch (error) {
          console.error('❌ Error managing game audio:', error);
        }
      } else if (gameState === "start") {
        // Resume background audio if it was playing before
        // But don't auto-play, let user control
        audioSystem.stopBackgroundMusic();
        audioSystem.stopEngineSound();

        // Sync toggle state with actual audio element state
        if (audioRef.current) {
          setIsAudioEnabled(!audioRef.current.paused);
        }
      } else {
        audioSystem.stopBackgroundMusic();
        audioSystem.stopEngineSound();
      }
    };

    handleGameAudio();
  }, [gameState]);

  // Cleanup audio system
  useEffect(() => {
    return () => {
      audioSystem.dispose();
    };
  }, []);

  // Game over screen
  if (gameState === "gameover") {
    return (
      <div className="relative w-screen h-screen overflow-hidden">
        <BackgroundScene />
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
                <Button onClick={resetGame} className="w-full" size="lg">
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
                                    variant={index < 3 ? "default" : "secondary"}
                                    className={`mr-3 ${index === 0 ? 'bg-gold' : index === 1 ? 'bg-silver' : index === 2 ? 'bg-bronze' : ''}`}
                                  >
                                    {index === 0 && "🥇"}
                                    {index === 1 && "🥈"}
                                    {index === 2 && "🥉"}
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

  // Ship selection screen
  if (gameState === "shipselect") {
    return (
      <div className="relative w-screen h-screen overflow-hidden">
        <BackgroundScene />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-8 relative">
              {/* Back Button - Above Title */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12">
                <Button
                  onClick={() => setGameState("start")}
                  variant="outline"
                  size="sm"
                  className="bg-background/80 backdrop-blur-sm border-primary/50 text-primary hover:bg-primary/10 hover:border-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)] transition-all duration-300 w-10 h-10 p-0"
                  aria-label="Go back to home"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>

              <h1 className="text-4xl md:text-6xl text-primary font-bold mb-4">SELECT YOUR SHIP</h1>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {SHIP_OPTIONS.map((ship) => (
                <Card
                  key={ship.id}
                  className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    selectedShip === ship.id
                      ? 'border-primary shadow-[0_0_20px_hsl(var(--primary)/0.6)] bg-primary/5'
                      : 'border-primary/30 hover:border-primary/60 bg-transparent'
                  }`}
                  onClick={() => handleShipSelect(ship.id)}
                >
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-full h-32 mb-4 bg-muted/30 rounded-lg flex items-center justify-center">
                        <ShipPreview shipId={ship.id} className="w-full h-full" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{ship.name}</h3>
                      <p className="text-white/80 text-sm">
                        {ship.id === "SHIP_1" ? "Sleek and aerodynamic design" : "Rugged and distinctive styling"}
                      </p>
                      {selectedShip === ship.id && (
                        <Badge className="mt-3 bg-primary text-primary-foreground">
                          SELECTED
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={startPlaying}
                size="lg"
                className="h-16 md:h-20 text-lg md:text-2xl px-8 md:px-12 bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/50 text-white shadow-[0_0_20px_hsl(var(--primary)/0.4)] focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Start the NAD RACER mission"
              >
                <span className="flex items-center gap-2 md:gap-4 font-bold tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <img src="/svg/play.svg" alt="Play" className="w-6 h-6 md:w-8 md:h-8" />
                  <span className="hidden sm:inline">LAUNCH MISSION</span>
                  <span className="sm:hidden">LAUNCH</span>
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full animate-pulse shadow-[0_0_6px_hsl(var(--primary)/0.8)]" aria-hidden="true"></div>
                </span>
              </Button>
              <p className="text-white/70 text-sm mt-4">
                All ships have identical performance
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  if (gameState === "playing") {
    return (
      <div className="relative w-screen h-screen overflow-hidden">
        <ErrorBoundary>
          <RacingScene
            score={score}
            setScore={setScore}
            setHealth={setHealth}
            health={health}
            endGame={endGame}
            gameState={gameState}
            controlsRef={controlsRef}
            selectedShip={selectedShip}
            onCoinCollect={handleGameCoinCollection}
            onObstacleHit={handleObstacleHit}
          />
        </ErrorBoundary>

        {/* Game HUD */}
        <Card className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.2)] z-10">
          <CardContent className="p-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl md:text-5xl text-primary font-bold font-mono">
                  {score.toLocaleString()}
                </div>
                <p className="text-xs uppercase text-muted-foreground mt-1">SCORE</p>
              </div>
              <div className="text-center">
                <div className="flex gap-1 mb-2 justify-center">
                  {Array(9).fill().map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-6 rounded-full transition-colors duration-200 ${
                        i < health * 3 ? getHealthColor(health) : "bg-muted"
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-xs uppercase text-foreground font-semibold">HEALTH</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FPS Counter */}
        <Badge
          variant="outline"
          className="absolute top-36 left-4 text-xs text-foreground border-primary/30 bg-background/80 backdrop-blur-sm"
        >
          FPS: {fps}
        </Badge>

        {/* Mobile Controls */}
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 flex justify-between w-11/12 max-w-md md:hidden gap-4">
          <Button
            variant="outline"
            size="lg"
            className="w-20 h-20 rounded-full border-2 border-primary/50 bg-transparent shadow-[0_0_10px_hsl(var(--primary)/0.3)] hover:bg-primary/10 active:bg-primary/20 p-0"
            onTouchStart={(e) => { e.preventDefault(); controlsRef.current.left = true; }}
            onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.left = false; }}
            aria-label="Move left"
          >
            <img src="/svg/left.svg" alt="Left" className="w-20 h-20" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-20 h-20 rounded-full border-2 border-primary/50 bg-transparent shadow-[0_0_10px_hsl(var(--primary)/0.3)] hover:bg-primary/10 active:bg-primary/20 p-0"
            onTouchStart={(e) => { e.preventDefault(); controlsRef.current.boost = true; }}
            onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.boost = false; }}
            aria-label="Boost"
          >
            <img src="/svg/fire.svg" alt="Boost" className="w-20 h-20" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-20 h-20 rounded-full border-2 border-primary/50 bg-transparent shadow-[0_0_10px_hsl(var(--primary)/0.3)] hover:bg-primary/10 active:bg-primary/20 p-0"
            onTouchStart={(e) => { e.preventDefault(); controlsRef.current.right = true; }}
            onTouchEnd={(e) => { e.preventDefault(); controlsRef.current.right = false; }}
            aria-label="Move right"
          >
            <img src="/svg/right.svg" alt="Right" className="w-20 h-20" />
          </Button>
        </div>
      </div>
    );
  }

  // Start/Home screen
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <BackgroundScene />

      <div className="absolute inset-0 flex flex-col items-center justify-start z-10 p-6 pt-20">
        <div className="max-w-2xl w-full text-center">
          {/* Game Title */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <Badge
                variant="outline"
                className="bg-background/80 backdrop-blur-sm border-primary/30 text-muted-foreground text-xs"
              >
                v{APP_VERSION}
              </Badge>
            </div>
            <h1 className="game-title text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider mb-4 relative"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--primary) / 0.3) 25%, hsl(var(--primary)) 50%, hsl(var(--primary) / 0.8) 75%, hsl(var(--foreground)) 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: `0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.2)`,
                  filter: 'drop-shadow(0 0 10px hsl(var(--primary) / 0.8)) brightness(1.1)',
                  animation: 'shimmer 4s ease-in-out infinite'
                }}>
              <style dangerouslySetInnerHTML={{
                __html: `
                  @keyframes shimmer {
                    0%, 100% {
                      background-position: 0% 50%;
                      filter: brightness(1.1) drop-shadow(0 0 10px hsl(var(--primary) / 0.8));
                    }
                    50% {
                      background-position: 100% 50%;
                      filter: brightness(1.3) drop-shadow(0 0 20px hsl(var(--primary) / 1));
                    }
                  }
                `
              }} />
              NAD RACER
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-6"></div>
          </div>




          {/* Main Play Button - Center */}
          <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-10">
            <Button
              onClick={startGame}
              size="lg"
              className="h-20 text-2xl px-12 bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/50 text-white shadow-[0_0_20px_hsl(var(--primary)/0.4)] focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Start the NAD RACER game"
            >
              <span className="flex items-center gap-4 font-bold tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <img src="/svg/play.svg" alt="Play" className="w-8 h-8" />
                LAUNCH
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_6px_hsl(var(--primary)/0.8)]" aria-hidden="true"></div>
              </span>
            </Button>
          </div>


        </div>
      </div>

      {/* Dock Component - Bottom of screen */}
      {monadWalletAddress && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <Dock 
            items={dockItems}
            panelHeight={68}
            baseItemSize={50}
            magnification={70}
          />
        </div>
      )}

      {/* Profile Dialog */}
      <ProfileDialog
        open={showProfile}
        onOpenChange={setShowProfile}
        monadUsername={monadUsername}
        monadWalletAddress={monadWalletAddress}
        blockchainHighScore={blockchainHighScore}
        loadingScore={loadingScore}
      />

      {/* Leaderboard Dialog */}
      <LeaderboardDialog
        open={showLeaderboard}
        onOpenChange={setShowLeaderboard}
        leaderboard={leaderboard}
        leaderboardLoading={leaderboardLoading}
      />

      {/* About Dialog */}
      <AboutDialog
        open={showAbout}
        onOpenChange={setShowAbout}
      />

      {/* Username Required Dialog */}
      <UsernameRequiredDialog
        open={showUsernameRequired}
        onOpenChange={setShowUsernameRequired}
      />

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src="https://github.com/mefury/Nad-Racer/raw/80807203ebfa9e19b917c3198f6163f34c4daeb9/audiomass-output%20(1).mp3"
        loop
        preload="auto"
        onError={(e) => console.error('Audio error:', e)}
        onLoadStart={() => console.log('Audio load start')}
        onCanPlay={() => console.log('Audio can play')}
        onLoadedData={() => console.log('Audio loaded data')}
        onPlay={() => console.log('🎵 Audio started playing')}
        onPause={() => console.log('🎵 Audio paused - checking if this is expected')}
      />
    </div>
  );
}

export default App;