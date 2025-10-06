/**
 * 检测状态管理
 * 使用Zustand管理全局检测状态
 */

import { create } from 'zustand';
import type {
  ProbeInfo,
  DetectionParameters,
  DefectInfo,
  WaveformDisplayConfig,
} from '@/types/detection';

interface DetectionState {
  // 状态
  isRecording: boolean;
  isPaused: boolean;
  probeStatus: ProbeInfo[];
  waveformData: {
    probe1: number[];
    probe2: number[];
    probe3: number[];
  };
  currentParameters: DetectionParameters;
  detectedDefects: DefectInfo[];
  displayConfig: WaveformDisplayConfig;
  
  // 工件信息
  currentWorkpieceId: string | null;
  
  // 动作
  startRecording: () => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  updateWaveformData: (probe: number, data: number[]) => void;
  updateProbeStatus: (probeId: number, status: 'offline' | 'online' | 'error') => void;
  updateParameters: (params: Partial<DetectionParameters>) => void;
  addDefect: (defect: DefectInfo) => void;
  clearDefects: () => void;
  setWorkpiece: (workpieceId: string) => void;
  updateDisplayConfig: (config: Partial<WaveformDisplayConfig>) => void;
  resetState: () => void;
}

// 默认参数
const defaultParameters: DetectionParameters = {
  probe1: {
    gain: 45.5,
    frequency: 5.0,
    filter: 'bandpass',
    threshold: 50,
  },
  probe2: {
    gain: 45.5,
    frequency: 5.0,
    filter: 'bandpass',
    threshold: 50,
  },
  probe3: {
    gain: 45.5,
    frequency: 5.0,
    filter: 'bandpass',
    threshold: 50,
  },
  gate: {
    gateA: {
      start: 0,
      width: 100,
      threshold: 60,
    },
    gateB: {
      start: 100,
      width: 100,
      threshold: 60,
    },
  },
  system: {
    samplingRate: 1000,
    averageCount: 16,
    detectionMode: 'full',
  },
};

const defaultDisplayConfig: WaveformDisplayConfig = {
  timeScale: 1.0,
  amplitudeScale: 1.0,
  showGrid: true,
  showPeaks: true,
  showCursor: true,
};

export const useDetectionStore = create<DetectionState>((set) => ({
  // 初始状态
  isRecording: false,
  isPaused: false,
  probeStatus: [
    { id: 1, status: 'online', config: defaultParameters.probe1 },
    { id: 2, status: 'online', config: defaultParameters.probe2 },
    { id: 3, status: 'online', config: defaultParameters.probe3 },
  ],
  waveformData: {
    probe1: [],
    probe2: [],
    probe3: [],
  },
  currentParameters: defaultParameters,
  detectedDefects: [],
  displayConfig: defaultDisplayConfig,
  currentWorkpieceId: null,
  
  // 动作实现
  startRecording: () => set({ isRecording: true, isPaused: false }),
  
  stopRecording: () => set({ 
    isRecording: false, 
    isPaused: false,
    waveformData: { probe1: [], probe2: [], probe3: [] },
  }),
  
  pauseRecording: () => set({ isPaused: true }),
  
  resumeRecording: () => set({ isPaused: false }),
  
  updateWaveformData: (probe: number, data: number[]) => set((state) => {
    const key = `probe${probe}` as 'probe1' | 'probe2' | 'probe3';
    return {
      waveformData: {
        ...state.waveformData,
        [key]: data,
      },
    };
  }),
  
  updateProbeStatus: (probeId: number, status: 'offline' | 'online' | 'error') => set((state) => ({
    probeStatus: state.probeStatus.map((probe) =>
      probe.id === probeId ? { ...probe, status } : probe
    ),
  })),
  
  updateParameters: (params: Partial<DetectionParameters>) => set((state) => ({
    currentParameters: { ...state.currentParameters, ...params },
  })),
  
  addDefect: (defect: DefectInfo) => set((state) => ({
    detectedDefects: [...state.detectedDefects, defect],
  })),
  
  clearDefects: () => set({ detectedDefects: [] }),
  
  setWorkpiece: (workpieceId: string) => set({ currentWorkpieceId: workpieceId }),
  
  updateDisplayConfig: (config: Partial<WaveformDisplayConfig>) => set((state) => ({
    displayConfig: { ...state.displayConfig, ...config },
  })),
  
  resetState: () => set({
    isRecording: false,
    isPaused: false,
    waveformData: { probe1: [], probe2: [], probe3: [] },
    currentParameters: defaultParameters,
    detectedDefects: [],
    displayConfig: defaultDisplayConfig,
    currentWorkpieceId: null,
  }),
}));
