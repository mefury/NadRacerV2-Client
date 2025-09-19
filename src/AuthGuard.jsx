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
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-md p-6">
          <div className="bg-background/90 backdrop-blur-sm p-6 rounded-xl border border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
            <h2 className="text-xl text-primary mb-4 font-bold">LOGIN REQUIRED</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Connect with your Monad Game ID to access the racing experience and compete on the global leaderboard.
            </p>

            <div className="flex justify-center">
              <div className="relative group">
                {/* Animated background glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Main button */}
                <button
                  onClick={() => {
                    console.log('AuthGuard: Login button clicked');
                    login(); // This will show the Privy login modal with Monad Games ID as primary option
                  }}
                  className="relative px-12 py-4 text-xl md:text-2xl bg-gradient-to-b from-background/60 to-background/40 border-2 border-primary/60 text-foreground rounded-xl hover:border-primary hover:shadow-[0_0_25px_hsl(var(--primary)/0.8)] hover:shadow-primary/20 transition-all duration-300 w-full max-w-xs overflow-hidden"
                >
                  {/* Animated inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  {/* Button content */}
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    <span className="tracking-wider">LOGIN</span>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  </div>

                  {/* Subtle border animation */}
                  <div className="absolute inset-0 rounded-xl border border-primary/30 group-hover:border-primary/80 transition-colors duration-300"></div>
                </button>

                {/* Floating particles effect */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full opacity-60 animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full opacity-40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center mt-4">
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