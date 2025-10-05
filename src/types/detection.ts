/**
 * 磁检测相关类型定义
 */

// ==================== 探头相关类型 ====================

/**
 * 探头状态
 */
export type ProbeStatus = 'offline' | 'online' | 'error';

/**
 * 探头配置参数
 */
export interface ProbeConfig {
  gain: number;          // 增益 (dB)
  frequency: number;     // 频率 (MHz)
  filter: 'lowpass' | 'highpass' | 'bandpass';  // 滤波器类型
  threshold: number;     // 阈值 (%)
}

/**
 * 探头信息
 */
export interface ProbeInfo {
  id: number;            // 探头编号 (1-3)
  status: ProbeStatus;   // 状态
  config: ProbeConfig;   // 配置
}

/**
 * 波形数据点
 */
export interface WaveformDataPoint {
  position: number;      // 位置 (mm)
  amplitude: number;     // 幅度 (V)
  isPeak?: boolean;      // 是否为峰值
}

/**
 * 波形统计数据
 */
export interface WaveformStatistics {
  max: number;           // 最大值
  min: number;           // 最小值
  average: number;       // 平均值
  stdDev: number;        // 标准差
}

/**
 * 探头波形数据
 */
export interface ProbeData {
  waveform: number[];              // 波形数据数组
  peaks: WaveformDataPoint[];      // 峰值信息
  statistics: WaveformStatistics;  // 统计信息
}

// ==================== 闸门相关类型 ====================

/**
 * 闸门配置
 */
export interface GateConfig {
  start: number;         // 起始位置 (mm)
  width: number;         // 宽度 (mm)
  threshold: number;     // 阈值 (%)
}

/**
 * 闸门设置
 */
export interface GateSettings {
  gateA: GateConfig;
  gateB: GateConfig;
}

// ==================== 系统配置类型 ====================

/**
 * 系统配置参数
 */
export interface SystemConfig {
  samplingRate: number;      // 采样率 (Hz)
  averageCount: number;      // 平均次数
  detectionMode: 'full' | 'half_positive' | 'half_negative';  // 检波模式
}

/**
 * 检测参数（完整配置）
 */
export interface DetectionParameters {
  probe1: ProbeConfig;
  probe2: ProbeConfig;
  probe3: ProbeConfig;
  gate: GateSettings;
  system: SystemConfig;
}

// ==================== 缺陷相关类型 ====================

/**
 * 缺陷类型
 */
export type DefectType = 'crack' | 'porosity' | 'inclusion' | 'other';

/**
 * 缺陷严重程度
 */
export type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * 缺陷位置
 */
export interface DefectPosition {
  x: number;             // X坐标 (mm)
  y: number;             // Y坐标 (mm)
  depth?: number;        // 深度 (mm)
}

/**
 * 缺陷尺寸
 */
export interface DefectSize {
  length: number;        // 长度 (mm)
  width: number;         // 宽度 (mm)
}

/**
 * 缺陷信息
 */
export interface DefectInfo {
  id: string;                    // 缺陷ID
  type: DefectType;              // 缺陷类型
  position: DefectPosition;      // 位置
  size: DefectSize;              // 尺寸
  severity: DefectSeverity;      // 严重程度
  probe: number;                 // 检测探头 (1-3)
  description: string;           // 描述
  imageUrl?: string;             // 图片URL
}

// ==================== 工件相关类型 ====================

/**
 * 工件尺寸
 */
export interface WorkpieceDimensions {
  length: number;        // 长度 (mm)
  width: number;         // 宽度 (mm)
  thickness: number;     // 厚度 (mm)
  weight: number;        // 重量 (kg)
  unit: string;          // 单位
}

/**
 * 工件状态
 */
export type WorkpieceStatus = 'pending' | 'in_progress' | 'completed';

/**
 * 工件信息
 */
export interface WorkpieceInfo {
  id: string;
  workpiece_no: string;
  material: string;
  dimensions: WorkpieceDimensions;
  standard?: string;
  description?: string;
  image_url?: string;
  status: WorkpieceStatus;
  created_at: string;
  updated_at: string;
}

// ==================== 检测记录类型 ====================

/**
 * 检测记录状态
 */
export type DetectionRecordStatus = 'draft' | 'completed' | 'approved';

/**
 * 检测记录
 */
export interface DetectionRecord {
  id: string;
  workpiece_id: string;
  operator_id: string;
  detection_date: string;
  parameters: DetectionParameters;
  probe1_data?: ProbeData;
  probe2_data?: ProbeData;
  probe3_data?: ProbeData;
  defects?: DefectInfo[];
  conclusion?: string;
  report_url?: string;
  status: DetectionRecordStatus;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// ==================== 用户相关类型 ====================

/**
 * 用户角色
 */
export type UserRole = 'operator' | 'engineer' | 'admin';

/**
 * 用户信息
 */
export interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// ==================== 参数模板类型 ====================

/**
 * 参数模板
 */
export interface ParameterTemplate {
  id: string;
  template_name: string;
  material_type: string;
  standard?: string;
  parameters: DetectionParameters;
  is_default: boolean;
  is_public: boolean;
  created_by?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ==================== UI状态类型 ====================

/**
 * 显示模式
 */
export type DisplayMode = 'waveform' | 'parameters' | 'history' | 'reports';

/**
 * 波形显示配置
 */
export interface WaveformDisplayConfig {
  timeScale: number;       // 时间轴缩放
  amplitudeScale: number;  // 幅度轴缩放
  showGrid: boolean;       // 显示网格
  showPeaks: boolean;      // 显示峰值
  showCursor: boolean;     // 显示游标
}
