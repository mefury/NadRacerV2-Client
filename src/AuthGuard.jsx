import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import BackgroundScene from './background.jsx';
import { Progress } from '@/components/ui/progress';

function AuthGuard({ children }) {
  const { ready, authenticated, user, login } = usePrivy();
  const [progress, setProgress] = useState(0);

  console.log('AuthGuard: ready=', ready, 'authenticated=', authenticated, 'user=', user);

  // Animate progress bar while loading
  useEffect(() => {
    if (!ready) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // Cap at 90% until ready
          return prev + Math.random() * 10; // Random increment for natural feel
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setProgress(100); // Complete when ready
    }
  }, [ready]);

  // Show loading while Privy is initializing
  if (!ready) {
    console.log('AuthGuard: Privy not ready yet');
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-background text-foreground flex items-center justify-center">
        <BackgroundScene />
        <div className="relative z-10 text-center">
          <h1 className="game-title text-2xl mb-4">INITIALIZING...</h1>
          <div className="w-64 mx-auto mb-2">
            <Progress value={progress} className="h-3" />
          </div>
          <div className="text-primary text-sm">{Math.round(progress)}% Complete</div>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!authenticated) {
    console.log('AuthGuard: User not authenticated, showing login screen');
    return (
      <div className="relative w-screen h-screen overflow-hidden bg-background text-foreground">
        <BackgroundScene />

        {/* Game Title - Centered */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <h1 className="game-title text-3xl sm:text-4xl md:text-5xl mb-6">NAD RACER</h1>
        </div>

        {/* Login Card - Bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4 sm:px-6" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}>
          <div className="bg-black/90 backdrop-blur-md p-4 sm:p-6 rounded-xl border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.25)]">
            <h2 className="text-lg sm:text-xl text-red-500 mb-3 sm:mb-4 font-bold text-center">LOGIN REQUIRED</h2>
            <p className="text-xs sm:text-sm text-white/80 mb-4 sm:mb-6 text-center">
              Connect with your Monad Game ID to access the racing experience and compete on the global leaderboard.
            </p>

            <div className="flex justify-center">
              <div className="relative group w-full max-w-xs">
                {/* Animated background glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-red-500/20 via-red-500/10 to-red-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Main button */}
                <button
                  onClick={() => {
                    console.log('AuthGuard: Login button clicked');
                    login(); // This will show the Privy login modal with Monad Games ID as primary option
                  }}
                  className="relative h-14 sm:h-16 text-lg sm:text-xl px-10 w-full bg-gradient-to-r from-red-500/20 to-red-500/10 border-2 border-red-500/50 text-white rounded-xl hover:border-red-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all duration-300 overflow-hidden"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {/* Animated inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  {/* Button content */}
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    <img src="/svg/play.svg" alt="Login" className="w-6 h-6" />
                    <span className="tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>LOGIN</span>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>

                  {/* Subtle border animation */}
                  <div className="absolute inset-0 rounded-xl border border-red-500/30 group-hover:border-red-500/80 transition-colors duration-300"></div>
                </button>

                {/* Floating particles effect */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-60 animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-red-500 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>

            <div className="text-[10px] sm:text-xs text-white/70 text-center mt-3 sm:mt-4 select-none">
              Powered by Monad & Privy
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render the main app
  console.log('AuthGuard: User authenticated, rendering main app');
  return children;
}

export default AuthGuard;