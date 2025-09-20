"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePrivy } from '@privy-io/react-auth';
import RacingScene from './racingscene.jsx';
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
import { useAudio } from '@/hooks/useAudio.js';
import { useGameSession } from '@/hooks/useGameSession.js';
  const { user, logout } = usePrivy();

  const [gameState, setGameState] = useState("start"); // start, shipselect, playing, gameover
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [selectedShip, setSelectedShip] = useState("SHIP_1");
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [lastTxStatus, setLastTxStatus] = useState(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [fps, setFps] = useState(0);

  // Leaderboard
  const { leaderboard, leaderboardLoading, refresh: refreshLeaderboard } = useLeaderboard();

  // Audio management
  const { audioRef, isAudioEnabled, handleAudioToggle } = useAudio(gameState);

  // Game session
  const { gameSessionId, startSession } = useGameSession();

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


  // Dialog states
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showUsernameRequired, setShowUsernameRequired] = useState(false);


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
    setSelectedShip(shipId);
  };

  const startPlaying = async () => {
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));

      // ANTI-CHEAT: Start game session
      if (monadWalletAddress) {
        await startSession(monadWalletAddress);
      }

      setScore(0);
      setHealth(3);
      setCollectedCoins(0);
      // Reset score submission status for new game
      resetSubmission();

      if (controlsRef.current) {
        controlsRef.current.left = false;
        controlsRef.current.right = false;
        controlsRef.current.boost = false;
      }

      setTimeout(() => {
        setGameState("playing");
      }, 500);
    } catch (error) {
      console.error('❌ Error starting game:', error);
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