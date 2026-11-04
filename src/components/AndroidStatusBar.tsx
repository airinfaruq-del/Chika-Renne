import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Radio } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-5 py-1.5 text-xs text-neutral-400 select-none bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900/60 z-30">
      <div className="flex items-center gap-2">
        <span className="font-mono font-medium text-neutral-200 tracking-tight">{timeStr || '12:00'}</span>
        <span className="text-[10px] text-cyan-400/90 font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"></span>
          OFFLINE
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-[11px] text-neutral-400">
          <Radio size={12} className="text-cyan-400" />
          <span className="font-mono text-[10px]">Hi-Res</span>
        </div>
        <Wifi size={13} className="text-neutral-400" />
        <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-300">
          <span>100%</span>
          <Battery size={14} className="text-emerald-400 rotate-90" />
        </div>
      </div>
    </div>
  );
};
