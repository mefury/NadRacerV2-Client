"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePrivy } from '@privy-io/react-auth';
import RacingScene from './racingscene.jsx';
import DockBar from '@/components/DockBar.jsx';
import ProfileDialog from '@/components/ProfileDialog';
import LeaderboardDialog from '@/components/LeaderboardDialog';
import AboutDialog from '@/components/AboutDialog';
import UsernameRequiredDialog from '@/components/UsernameRequiredDialog';
import StartScreen from '@/screens/StartScreen.jsx';
import PlayingHud from '@/screens/PlayingHud.jsx';
import GameOverOverlay from '@/screens/GameOverOverlay.jsx';
import LoadingScreen from '@/screens/LoadingScreen.jsx';
import { APP_VERSION } from '@/constants/game.js';
import { useFps } from '@/hooks/useFps.js';
import { useLeaderboard } from '@/hooks/useLeaderboard.js';
import { useMonadUser } from '@/hooks/useMonadUser.js';
import { useScoreSubmission } from '@/hooks/useScoreSubmission.js';
import { useAudio } from '@/hooks/useAudio.js';
import { useGameSession } from '@/hooks/useGameSession.js';
import { audioSystem } from './audioSystem.js';

function App() {
  const { user, logout } = usePrivy();

  const [gameState, setGameState] = useState("start"); // start, shipselect, playing, gameover
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [fps, setFps] = useState(0);

  // Leaderboard
  const { leaderboard, leaderboardLoading, refresh: refreshLeaderboard } = useLeaderboard();

  // Loading overlay state
  const [showLoader, setShowLoader] = useState(false);
  const [loaderValue, setLoaderValue] = useState(0);

  const runLoader = (durationMs, onDone) => {
    setShowLoader(true);
    setLoaderValue(0);
    const step = 50; // ms
    const increment = 100 / Math.max(1, durationMs / step);
    let current = 0;
    const id = setInterval(() => {
      current = Math.min(100, current + increment);
      setLoaderValue(current);
      if (current >= 100) {
        clearInterval(id);
        // Perform the transition first, then hide the overlay shortly after
        Promise.resolve(onDone?.()).finally(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              setShowLoader(false);
            }, 100);
          });
        });
      }
    }, step);
  };

  // Audio management
  const { audioRef, isAudioEnabled, handleAudioToggle } = useAudio(gameState);

  // Game session
  const { gameSessionId, startSession } = useGameSession();

  // Player data and Monad wallet
  const { monadWalletAddress, monadUsername, hasUsername, blockchainHighScore, loadingScore } = useMonadUser(user);

  // Score submission
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
    // Show loader and then start the game
    runLoader(700, () => startPlaying());
  };

  const endGame = () => {
    setGameState("gameover");
  };

  const resetGame = () => {
    // Reset score submission status
    resetSubmission();
    // Clear controls
    if (controlsRef.current) {
      controlsRef.current.left = false;
      controlsRef.current.right = false;
      controlsRef.current.boost = false;
    }
    // Show loader then go to start screen
    runLoader(600, () => setGameState("start"));
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

      setGameState("playing");
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



  // FPS tracking
  useFps(gameState === "playing", setFps);


  // Removed separate gameover screen; we'll overlay results in the playing container


  // Playing screen
  if (gameState === "playing" || gameState === "gameover") {
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
          selectedShip={'SHIP_1'}
          onCoinCollect={handleGameCoinCollection}
          onObstacleHit={handleObstacleHit}
        />

        <PlayingHud score={score} health={health} fps={fps} controlsRef={controlsRef} />
        {gameState === 'gameover' && (
          <GameOverOverlay
            score={score}
            submittingScore={submittingScore}
            scoreSubmissionStatus={scoreSubmissionStatus}
            scoreSubmissionMessage={scoreSubmissionMessage}
            onPlayAgain={resetGame}
          />
        )}
        {showLoader && <LoadingScreen value={loaderValue} />}
      </div>
    );
  }

  // Start/Home screen
  return (
    <>
      <StartScreen appVersion={APP_VERSION} onStart={startGame} />
      {showLoader && <LoadingScreen value={loaderValue} />
      }
      {/* Dock Component - Bottom of screen */}
      {monadWalletAddress && (
        <DockBar
          isAudioEnabled={isAudioEnabled}
          onToggleAudio={handleAudioToggle}
          onProfile={() => setShowProfile(true)}
          onLeaderboard={() => setShowLeaderboard(true)}
          onAbout={() => setShowAbout(true)}
          onLogout={logout}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
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
}

export default App;
