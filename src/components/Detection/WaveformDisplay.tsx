/**
 * 波形显示组件
 * 使用Canvas高性能渲染三探头波形
 */

import { useEffect, useRef } from 'react';
import { useDetectionStore } from '@/stores/detectionStore';

interface WaveformDisplayProps {
  width?: number;
  height?: number;
  className?: string;
}

export function WaveformDisplay({ width, height, className = '' }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { waveformData, displayConfig, probeStatus } = useDetectionStore();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 设置Canvas尺寸
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = width || parent.clientWidth;
      canvas.height = height || parent.clientHeight;
    }
    
    // 绘制波形
    drawWaveform(ctx, canvas.width, canvas.height);
  }, [waveformData, displayConfig, width, height]);
  
  const drawWaveform = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // 清空画布
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);
    
    // 绘制网格
    if (displayConfig.showGrid) {
      drawGrid(ctx, w, h);
    }
    
    // 绘制三条波形
    const colors = ['#ff8c00', '#00ff00', '#00ccff'];
    const probeData = [waveformData.probe1, waveformData.probe2, waveformData.probe3];
    
    probeData.forEach((data, index) => {
      if (data.length === 0 || probeStatus[index]?.status !== 'online') return;
      
      const yOffset = (index + 1) * h / 4;
      const scale = (h / 8) * displayConfig.amplitudeScale;
      
      ctx.strokeStyle = colors[index] || '#ff8c00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      data.forEach((value, i) => {
        const x = (i / data.length) * w * displayConfig.timeScale;
        const y = yOffset - value * scale;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // 绘制探头标签
      ctx.fillStyle = colors[index] || '#ff8c00';
      ctx.font = '14px system-ui';
      ctx.fillText(`探头 ${index + 1}`, 10, yOffset - 60);
      
      // 显示峰值
      if (displayConfig.showPeaks && data.length > 0) {
        const max = Math.max(...data);
        const min = Math.min(...data);
        ctx.fillStyle = colors[index] || '#ff8c00';
        ctx.font = '12px system-ui';
        ctx.fillText(`Max: ${max.toFixed(2)}V`, 10, yOffset - 40);
        ctx.fillText(`Min: ${min.toFixed(2)}V`, 10, yOffset - 25);
      }
    });
  };
  
  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    
    // 垂直线
    for (let x = 0; x < w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    
    // 水平线
    for (let y = 0; y < h; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  };
  
  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
