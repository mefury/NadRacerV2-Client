import React from 'react';
import { Progress } from '@/components/ui/progress';

function LoadingScreen({ value = 0 }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-64">
        <Progress value={value} className="h-3" />
      </div>
    </div>
  );
}

export default LoadingScreen;
