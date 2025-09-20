import React, { useMemo } from 'react';
import Dock from '@/components/Dock';
import { Play, Pause, User, Trophy, Info, LogOut } from 'lucide-react';

function DockBar({
  isAudioEnabled,
  onToggleAudio,
  onProfile,
  onLeaderboard,
  onAbout,
  onLogout,
  panelHeight = 68,
  baseItemSize = 50,
  magnification = 70,
}) {
  const glow = "drop-shadow-[0_0_8px_rgba(239,68,68,0.9)]"; // red glow
  const btnClass = "bg-black/60 border-red-500/20 hover:bg-black/70";

  const items = useMemo(() => [
    {
      icon: <User size={18} className={`text-red-500 ${glow}`} />,
      label: 'Profile',
      onClick: onProfile,
      className: btnClass,
    },
    {
      icon: <Trophy size={18} className={`text-red-500 ${glow}`} />,
      label: 'Leaderboard',
      onClick: onLeaderboard,
      className: btnClass,
    },
    {
      icon: <Info size={18} className={`text-red-500 ${glow}`} />,
      label: 'About',
      onClick: onAbout,
      className: btnClass,
    },
    {
      icon: isAudioEnabled ? (
        <Pause size={18} className={`text-red-500 ${glow}`} />
      ) : (
        <Play size={18} className={`text-red-500 ${glow}`} />
      ),
      label: isAudioEnabled ? 'Pause Audio' : 'Play Audio',
      onClick: () => onToggleAudio(!isAudioEnabled),
      className: btnClass,
    },
    {
      icon: <LogOut size={18} className={`text-red-500 ${glow}`} />,
      label: 'Logout',
      onClick: onLogout,
      className: btnClass,
    },
  ], [isAudioEnabled, onToggleAudio, onProfile, onLeaderboard, onAbout, onLogout]);

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-30"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
    >
      <Dock
        items={items}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
        className="border-red-500/30 bg-black/50 backdrop-blur-md shadow-[0_0_24px_rgba(239,68,68,0.25)]"
      />
    </div>
  );
}

export default DockBar;
