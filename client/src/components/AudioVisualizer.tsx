import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
}

export function AudioVisualizer({ analyserNode, isActive }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw circular frequency bars
      const barsCount = 64;
      const step = Math.floor(bufferLength / barsCount);
      const baseRadius = Math.min(width, height) * 0.22;

      for (let i = 0; i < barsCount; i++) {
        const value = dataArray[i * step] ?? 0;
        const normalizedValue = value / 255;

        const angle = (i / barsCount) * Math.PI * 2 - Math.PI / 2;
        const barLength = normalizedValue * baseRadius * 0.6;

        const x1 = centerX + Math.cos(angle) * baseRadius;
        const y1 = centerY + Math.sin(angle) * baseRadius;
        const x2 = centerX + Math.cos(angle) * (baseRadius + barLength);
        const y2 = centerY + Math.sin(angle) * (baseRadius + barLength);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(124, 106, 240, ${0.3 + normalizedValue * 0.7})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Inner glow circle
      const avgValue = dataArray.reduce((sum, v) => sum + v, 0) / bufferLength / 255;
      const glowRadius = baseRadius * (0.95 + avgValue * 0.1);
      const gradient = ctx.createRadialGradient(
        centerX, centerY, glowRadius * 0.5,
        centerX, centerY, glowRadius
      );
      gradient.addColorStop(0, `rgba(124, 106, 240, ${avgValue * 0.12})`);
      gradient.addColorStop(1, 'rgba(124, 106, 240, 0)');
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [analyserNode, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
