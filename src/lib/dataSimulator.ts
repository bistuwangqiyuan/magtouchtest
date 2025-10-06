/**
 * 数据模拟器
 * 用于开发测试，模拟三探头实时数据采集
 * 注意：生产环境应替换为真实硬件接口
 */

/**
 * 生成模拟波形数据
 * @param length 数据点数量
 * @param amplitude 幅度
 * @param frequency 频率
 * @param noise 噪声级别
 * @returns 波形数据数组
 */
export function generateWaveformData(
  length: number = 1000,
  amplitude: number = 0.8,
  frequency: number = 5,
  noise: number = 0.05
): number[] {
  const data: number[] = [];
  
  for (let i = 0; i < length; i++) {
    const t = i / length;
    const signal = Math.sin(2 * Math.PI * frequency * t) * amplitude;
    const noiseValue = (Math.random() - 0.5) * noise;
    data.push(signal + noiseValue);
  }
  
  return data;
}

/**
 * 生成带缺陷的波形数据
 * @param length 数据点数量
 * @param defectPosition 缺陷位置 (0-1)
 * @param defectAmplitude 缺陷幅度
 * @returns 波形数据数组
 */
export function generateDefectWaveform(
  length: number = 1000,
  defectPosition: number = 0.5,
  defectAmplitude: number = 0.9
): number[] {
  const data = generateWaveformData(length);
  
  // 在指定位置添加缺陷信号（尖峰）
  const defectIndex = Math.floor(length * defectPosition);
  const defectWidth = 20;
  
  for (let i = Math.max(0, defectIndex - defectWidth); i < Math.min(length, defectIndex + defectWidth); i++) {
    const distance = Math.abs(i - defectIndex);
    const factor = 1 - (distance / defectWidth);
    const currentValue = data[i];
    if (currentValue !== undefined) {
      data[i] = currentValue + defectAmplitude * factor;
    }
  }
  
  return data;
}

/**
 * 实时数据模拟器类
 */
export class DataSimulator {
  private intervalId: number | null = null;
  private isRunning = false;
  private sampleRate = 1000; // Hz
  private updateInterval = 100; // ms
  
  /**
   * 开始数据采集模拟
   * @param onData 数据回调函数
   * @param hasDefect 是否包含缺陷
   */
  start(onData: (probe: number, data: number[]) => void, hasDefect: boolean = false) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    let sampleCount = 0;
    
    this.intervalId = window.setInterval(() => {
      if (!this.isRunning) return;
      
      // 为三个探头生成数据
      for (let probe = 1; probe <= 3; probe++) {
        let data: number[];
        
        if (hasDefect && Math.random() > 0.95) {
          // 5%概率生成带缺陷的数据
          data = generateDefectWaveform(
            this.sampleRate * this.updateInterval / 1000,
            Math.random(),
            0.8 + Math.random() * 0.2
          );
        } else {
          // 正常数据
          data = generateWaveformData(
            this.sampleRate * this.updateInterval / 1000,
            0.6 + Math.random() * 0.2,
            4 + probe * 0.5,
            0.05
          );
        }
        
        onData(probe, data);
      }
      
      sampleCount++;
    }, this.updateInterval);
  }
  
  /**
   * 停止数据采集
   */
  stop() {
    this.isRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * 设置采样率
   */
  setSampleRate(rate: number) {
    this.sampleRate = rate;
  }
  
  /**
   * 设置更新间隔
   */
  setUpdateInterval(interval: number) {
    this.updateInterval = interval;
  }
}
