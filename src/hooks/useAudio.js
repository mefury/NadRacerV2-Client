import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { audioSystem } from '@/audioSystem.js';

// Manages background <audio> element and in-game AudioSystem based on gameState
// Returns { audioRef, isAudioEnabled, handleAudioToggle }
export function useAudio(gameState) {
  const audioRef = useRef(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Test audio file accessibility (as in original App.jsx)
  useEffect(() => {
    let cancelled = false;
    const testAudio = async () => {
      try {
        const response = await fetch(
          'https://github.com/mefury/Nad-Racer/raw/80807203ebfa9e19b917c3198f6163f34c4daeb9/audiomass-output%20(1).mp3'
        );
        console.log('Audio file fetch response:', response.status, response.ok);
        if (response.ok) {
          console.log('Audio file is accessible');
        } else {
          console.error('Audio file not accessible:', response.status);
        }
      } catch (error) {
        if (!cancelled) console.error('Error fetching audio file:', error);
      }
    };
    testAudio();

    // Debug the audio element shortly after mount
    const t = setTimeout(() => {
      console.log('Audio ref after mount:', audioRef.current);
      if (audioRef.current) {
        console.log('Audio element src:', audioRef.current.src);
        console.log('Audio element readyState:', audioRef.current.readyState);
      }
    }, 1000);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  // First user interaction bootstrap to allow autoplay
  useEffect(() => {
    const handleFirstInteraction = async () => {
      try {
        console.log('First user interaction detected');
        await audioSystem.handleUserInteraction();

        // Auto-play background <audio> after first interaction
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
      } finally {
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
        window.removeEventListener('mousemove', handleFirstInteraction);
      }
    };

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

  // Toggle handler for background <audio>
  const handleAudioToggle = useCallback(async (enabled) => {
    console.log('Audio toggle:', enabled);
    console.log('Audio ref exists:', !!audioRef.current);
    setIsAudioEnabled(enabled);
    if (audioRef.current) {
      console.log('Audio element:', audioRef.current);
      console.log('Current paused state:', audioRef.current.paused);
      try {
        if (enabled) {
          await audioSystem.handleUserInteraction();
          console.log('Attempting to play audio...');
          console.log('Audio src:', audioRef.current.src);
          console.log('Audio readyState:', audioRef.current.readyState);
          audioRef.current.currentTime = 0;
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
        setIsAudioEnabled(false);
      }
    } else {
      console.error('Audio ref not available');
    }
  }, []);

  // Manage in-game audio based on gameState
  useEffect(() => {
    const handleGameAudio = async () => {
      if (gameState === 'playing') {
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

          // Pause background page audio while in game
          if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsAudioEnabled(false);
          }
        } catch (error) {
          console.error('❌ Error managing game audio:', error);
        }
      } else if (gameState === 'start') {
        // Stop game audio when not playing; keep page audio under user control
        audioSystem.stopBackgroundMusic();
        audioSystem.stopEngineSound();

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

  // Cleanup audio system on unmount
  useEffect(() => {
    return () => {
      audioSystem.dispose();
    };
  }, []);

  return { audioRef, isAudioEnabled, handleAudioToggle };
}
