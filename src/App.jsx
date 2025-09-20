"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePrivy } from '@privy-io/react-auth';
import { startGameSession } from './backendService.js';
import { audioSystem } from './audioSystem.js';
import RacingScene from './racingscene.jsx';
import BackgroundScene from './background.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, User, Trophy, Info, LogOut } from 'lucide-react';
import Dock from '@/components/Dock';
import ProfileDialog from '@/components/ProfileDialog';
import LeaderboardDialog from '@/components/LeaderboardDialog';
import AboutDialog from '@/components/AboutDialog';
import UsernameRequiredDialog from '@/components/UsernameRequiredDialog';
import StartScreen from '@/screens/StartScreen.jsx';
import ShipSelectScreen from '@/screens/ShipSelectScreen.jsx';
import PlayingHud from '@/screens/PlayingHud.jsx';
import GameOverScreen from '@/screens/GameOverScreen.jsx';
import { APP_VERSION, SHIP_OPTIONS } from '@/constants/game.js';
import { useFps } from '@/hooks/useFps.js';
import { useLeaderboard } from '@/hooks/useLeaderboard.js';
import { useMonadUser } from '@/hooks/useMonadUser.js';
import { useScoreSubmission } from '@/hooks/useScoreSubmission.js';
  const { user, logout } = usePrivy();

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

  // Leaderboard
  const { leaderboard, leaderboardLoading, refresh: refreshLeaderboard } = useLeaderboard();

  // Player data and Monad wallet
  const { monadWalletAddress, monadUsername, hasUsername, blockchainHighScore, loadingScore } = useMonadUser(user);

  // Score submission
  const [gameSessionId, setGameSessionId] = useState(null); // anti-cheat
  const { submittingScore, scoreSubmissionStatus, scoreSubmissionMessage, resetSubmission } = useScoreSubmission({
    gameState,
    monadWalletAddress,
    score,
    gameSessionId,
    onLeaderboardRefresh: refreshLeaderboard,
  });

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
    // Reset score submission status
    resetSubmission();
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
  useFps(gameState === "playing", setFps);

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
      <GameOverScreen
        score={score}
        collectedCoins={collectedCoins}
        submittingScore={submittingScore}
        scoreSubmissionStatus={scoreSubmissionStatus}
        scoreSubmissionMessage={scoreSubmissionMessage}
        onPlayAgain={resetGame}
        leaderboard={leaderboard}
        leaderboardLoading={leaderboardLoading}
      />
    );
  }

  // Ship selection screen
  if (gameState === "shipselect") {
    return (
      <ShipSelectScreen
        shipOptions={SHIP_OPTIONS}
        selectedShip={selectedShip}
        onSelect={handleShipSelect}
        onLaunch={startPlaying}
        onBack={() => setGameState("start")}
      />
    );
  }

  // Playing screen
  if (gameState === "playing") {
    return (
      <div className="relative w-screen h-screen overflow-hidden">
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

        <PlayingHud score={score} health={health} fps={fps} controlsRef={controlsRef} />
      </div>
    );
  }

  // Start/Home screen
  return (
    <>
      <StartScreen appVersion={APP_VERSION} onStart={startGame} />

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
    </>
  );
  );
}

export default App;