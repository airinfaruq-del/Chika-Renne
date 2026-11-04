import React, { useEffect, useRef } from 'react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { VisualizerMode } from '../types/player';

interface AudioVisualizerProps {
  className?: string;
  modeOverride?: VisualizerMode;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ className = '', modeOverride }) => {
  const { analyserNode, isPlaying, visualizerMode } = useAudioPlayer();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const peaksRef = useRef<number[]>([]);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; radius: number; hue: number }>>([]);
  const activeMode = modeOverride || visualizerMode;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Handle high DPI
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles if needed
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 65; i++) {
        particlesRef.current.push({
          x: Math.random() * 800,
          y: Math.random() * 400,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: Math.random() * 3 + 1.5,
          hue: Math.random() * 60 + 170 // cyan to purple range
        });
      }
    }

    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    let idleAngle = 0;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(dataArray);
      } else {
        // Subtle ambient breathing simulation when idle or loading
        idleAngle += 0.03;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(8, Math.sin(idleAngle + i * 0.18) * 20 + 22);
        }
      }

      // Draw depending on mode
      if (activeMode === 'bars') {
        drawBars(ctx, dataArray, width, height);
      } else if (activeMode === 'circle') {
        drawCircle(ctx, dataArray, width, height);
      } else if (activeMode === 'wave') {
        drawWave(ctx, dataArray, width, height);
      } else if (activeMode === 'particles') {
        drawParticles(ctx, dataArray, width, height);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [analyserNode, isPlaying, activeMode]);

  // Mode 1: Cyber Spectrum Bars
  const drawBars = (ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number) => {
    const barCount = 48;
    const barSpacing = 4;
    const totalSpacing = (barCount - 1) * barSpacing;
    const barWidth = Math.max(3, (width - totalSpacing) / barCount);

    if (peaksRef.current.length !== barCount) {
      peaksRef.current = new Array(barCount).fill(0);
    }

    for (let i = 0; i < barCount; i++) {
      const dataIdx = Math.floor((i / barCount) * (data.length * 0.75));
      const val = data[dataIdx] || 0;
      const barHeight = Math.max(4, (val / 255) * (height - 24));
      const x = i * (barWidth + barSpacing);
      const y = height - barHeight;

      // Update peak
      if (barHeight > peaksRef.current[i]) {
        peaksRef.current[i] = barHeight;
      } else {
        peaksRef.current[i] = Math.max(0, peaksRef.current[i] - 1.2);
      }

      // Bar gradient (Cyan to Violet / Amber)
      const grad = ctx.createLinearGradient(0, height, 0, y);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.25)'); // cyan-500
      grad.addColorStop(0.6, 'rgba(14, 165, 233, 0.75)'); // sky-500
      grad.addColorStop(1, 'rgba(168, 85, 247, 0.95)'); // purple-500

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
      ctx.fill();

      // Peak cap indicator
      const peakY = height - peaksRef.current[i] - 2;
      ctx.fillStyle = 'rgba(244, 244, 245, 0.85)';
      ctx.fillRect(x, Math.max(2, peakY), barWidth, 2);
    }
  };

  // Mode 2: Radial Circular Spectrum
  const drawCircle = (ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const baseRadius = Math.min(width, height) * 0.26;
    const bars = 64;

    ctx.save();
    ctx.translate(centerX, centerY);

    // Inner glow ring
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius - 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (let i = 0; i < bars; i++) {
      const angle = (i / bars) * Math.PI * 2;
      const dataIdx = Math.floor((i / bars) * (data.length * 0.65));
      const val = data[dataIdx] || 0;
      const barLen = (val / 255) * (baseRadius * 0.85);

      const x1 = Math.cos(angle) * baseRadius;
      const y1 = Math.sin(angle) * baseRadius;
      const x2 = Math.cos(angle) * (baseRadius + barLen);
      const y2 = Math.sin(angle) * (baseRadius + barLen);

      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
      grad.addColorStop(1, 'rgba(236, 72, 153, 0.9)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Mode 3: Smooth Neon Oscilloscope Wave
  const drawWave = (ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number) => {
    ctx.beginPath();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#06b6d4'; // bright cyan
    ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
    ctx.shadowBlur = 10;

    const sliceWidth = width / (data.length - 1);
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 255.0;
      const y = height / 2 + (v - 0.5) * (height * 0.85);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();
    ctx.shadowBlur = 0; // reset
  };

  // Mode 4: Bass-Reactive Floating Particles
  const drawParticles = (ctx: CanvasRenderingContext2D, data: Uint8Array, width: number, height: number) => {
    // Average bass energy
    let bassSum = 0;
    for (let i = 0; i < 8; i++) {
      bassSum += data[i] || 0;
    }
    const bassFactor = bassSum / 8 / 255; // 0 to 1

    particlesRef.current.forEach((p) => {
      p.x += p.vx * (1 + bassFactor * 2);
      p.y += p.vy * (1 + bassFactor * 2);

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      const dynamicRadius = p.radius * (1 + bassFactor * 1.5);

      ctx.beginPath();
      ctx.arc(p.x, p.y, dynamicRadius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 85%, 65%, ${0.4 + bassFactor * 0.5})`;
      ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, 0.7)`;
      ctx.shadowBlur = bassFactor > 0.4 ? 8 : 2;
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
