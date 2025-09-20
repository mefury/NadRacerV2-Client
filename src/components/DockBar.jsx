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
  const items = useMemo(() => [
    {
      icon: <User size={18} className="text-blue-500" />,
      label: 'Profile',
      onClick: onProfile,
    },
    {
      icon: <Trophy size={18} className="text-yellow-500" />,
      label: 'Leaderboard',
      onClick: onLeaderboard,
    },
    {
      icon: <Info size={18} className="text-blue-500" />,
      label: 'About',
      onClick: onAbout,
    },
    {
      icon: isAudioEnabled ? (
        <Pause size={18} className="text-purple-500" />
      ) : (
        <Play size={18} className="text-green-500" />
      ),
      label: isAudioEnabled ? 'Pause Audio' : 'Play Audio',
      onClick: () => onToggleAudio(!isAudioEnabled),
    },
    {
      icon: <LogOut size={18} className="text-red-500" />,
      label: 'Logout',
      onClick: onLogout,
    },
  ], [isAudioEnabled, onToggleAudio, onProfile, onLeaderboard, onAbout, onLogout]);

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
      <Dock items={items} panelHeight={panelHeight} baseItemSize={baseItemSize} magnification={magnification} />
    </div>
  );
}

export default DockBar;
