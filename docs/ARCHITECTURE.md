# 技术架构文档

## 1. 系统架构概览

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Web浏览器    │  │    平板      │  │  触摸屏设备   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      CDN层 (Netlify)                         │
│  静态资源分发、HTTPS、全球加速                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      前端应用层                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Astro Static Site                        │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │  检测界面   │  │  历史记录   │  │  系统设置   │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         React/Preact 交互组件                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │ 波形显示    │  │ 参数配置    │  │ 数据图表    │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           状态管理 (Zustand)                          │  │
│  │  - detectionStore  - userStore  - configStore       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   后端服务层 (Supabase)                       │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │   PostgreSQL  │  │  Auth Service │  │    Storage    │  │
│  │   数据库      │  │  用户认证     │  │  文件存储     │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
│  ┌───────────────┐  ┌───────────────┐                      │
│  │   Realtime    │  │  Edge Funcs   │                      │
│  │  实时通信     │  │  服务端逻辑   │                      │
│  └───────────────┘  └───────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      硬件设备层                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   探头1      │  │   探头2      │  │   探头3      │      │
│  │  (Probe 1)   │  │  (Probe 2)   │  │  (Probe 3)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术选型理由

#### Astro框架
**优势**:
- 零JavaScript默认输出，页面加载速度快
- 岛屿架构(Islands Architecture)，按需加载交互组件
- 支持多种UI框架集成（React/Vue/Svelte）
- 优秀的SEO支持
- 简单的文件路由系统

**适用场景**: 内容为主的应用，需要快速加载和良好的性能

#### Supabase
**优势**:
- 开源的Firebase替代方案
- 基于PostgreSQL，功能强大
- 内置认证、存储、实时订阅
- RESTful API和实时API
- Row Level Security (RLS)

**适用场景**: 需要快速开发的数据密集型应用

#### Tailwind CSS
**优势**:
- 实用优先的设计系统
- 高度可定制
- 开发效率高
- 生产构建体积小（PurgeCSS）
- 响应式设计简单

**适用场景**: 需要快速构建自定义UI的项目

## 2. 前端架构

### 2.1 目录结构

```
src/
├── components/           # 组件目录
│   ├── Layout/          # 布局组件
│   │   ├── Header.astro
│   │   ├── Sidebar.astro
│   │   ├── MainLayout.astro
│   │   └── Footer.astro
│   ├── Detection/       # 检测相关组件
│   │   ├── WaveformDisplay.tsx      # 波形显示
│   │   ├── ProbeStatus.tsx          # 探头状态
│   │   ├── ParameterPanel.tsx       # 参数面板
│   │   ├── GateControl.tsx          # 闸门控制
│   │   └── RealtimeMonitor.tsx      # 实时监控
│   ├── Config/          # 配置组件
│   │   ├── ProbeConfig.tsx          # 探头配置
│   │   ├── GateConfig.tsx           # 闸门配置
│   │   ├── DACConfig.tsx            # DAC曲线配置
│   │   └── TemplateManager.tsx      # 模板管理
│   ├── Data/            # 数据组件
│   │   ├── HistoryList.tsx          # 历史列表
│   │   ├── DataTable.tsx            # 数据表格
│   │   ├── ChartDisplay.tsx         # 图表显示
│   │   └── ExportPanel.tsx          # 导出面板
│   ├── Report/          # 报告组件
│   │   ├── ReportPreview.tsx        # 报告预览
│   │   ├── ReportTemplate.tsx       # 报告模板
│   │   └── PDFGenerator.tsx         # PDF生成
│   └── Common/          # 通用组件
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── Loading.tsx
│       └── ErrorBoundary.tsx
├── pages/               # 页面路由
│   ├── index.astro                  # 主检测界面
│   ├── history.astro                # 历史记录
│   ├── workpiece.astro              # 工件管理
│   ├── settings.astro               # 系统设置
│   ├── reports.astro                # 报告管理
│   └── login.astro                  # 登录页面
├── lib/                 # 核心库
│   ├── supabase.ts                  # Supabase客户端
│   ├── detection/                   # 检测逻辑
│   │   ├── dataAcquisition.ts      # 数据采集
│   │   ├── signalProcessing.ts     # 信号处理
│   │   └── defectAnalysis.ts       # 缺陷分析
│   ├── waveform/                    # 波形处理
│   │   ├── renderer.ts             # 渲染引擎
│   │   ├── calculator.ts           # 计算器
│   │   └── fft.ts                  # FFT算法
│   └── report/                      # 报告生成
│       ├── pdfGenerator.ts         # PDF生成器
│       └── templates.ts            # 报告模板
├── stores/              # 状态管理
│   ├── detectionStore.ts           # 检测状态
│   ├── userStore.ts                # 用户状态
│   ├── configStore.ts              # 配置状态
│   └── uiStore.ts                  # UI状态
├── types/               # 类型定义
│   ├── detection.ts
│   ├── waveform.ts
│   ├── database.ts
│   └── common.ts
├── utils/               # 工具函数
│   ├── dataProcessing.ts           # 数据处理
│   ├── validation.ts               # 数据验证
│   ├── formatters.ts               # 格式化
│   └── constants.ts                # 常量定义
└── styles/              # 样式
    ├── global.css                  # 全局样式
    └── industrial-theme.css        # 工业主题
```

### 2.2 组件设计原则

#### 2.2.1 组件分类

**展示组件 (Presentational Components)**
- 纯函数组件
- 只负责UI渲染
- 通过props接收数据
- 无状态或只有UI状态

示例：
```typescript
// Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant, size, children, onClick }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

**容器组件 (Container Components)**
- 连接状态管理
- 处理业务逻辑
- 获取和更新数据
- 将数据传递给展示组件

示例：
```typescript
// DetectionContainer.tsx
import { useDetectionStore } from '@/stores/detectionStore';
import { WaveformDisplay } from './WaveformDisplay';

export function DetectionContainer() {
  const { waveformData, isRecording, startRecording } = useDetectionStore();
  
  return (
    <WaveformDisplay 
      data={waveformData}
      isRecording={isRecording}
      onStart={startRecording}
    />
  );
}
```

#### 2.2.2 性能优化策略

**1. 代码分割**
```typescript
// 动态导入大型组件
const PDFGenerator = lazy(() => import('./PDFGenerator'));
const ChartDisplay = lazy(() => import('./ChartDisplay'));
```

**2. 虚拟滚动**
```typescript
// 历史记录列表使用虚拟滚动
import { VirtualList } from '@/components/VirtualList';

<VirtualList 
  items={historyRecords}
  itemHeight={60}
  renderItem={(item) => <RecordItem data={item} />}
/>
```

**3. Canvas优化**
```typescript
// 波形渲染使用离屏Canvas
class WaveformRenderer {
  private offscreenCanvas: OffscreenCanvas;
  
  render(data: number[]) {
    // 在离屏Canvas上绘制
    const ctx = this.offscreenCanvas.getContext('2d');
    // ... 绘制逻辑
    
    // 一次性复制到主Canvas
    mainCtx.drawImage(this.offscreenCanvas, 0, 0);
  }
}
```

### 2.3 状态管理

#### 2.3.1 Zustand Store设计

**检测状态管理**
```typescript
// stores/detectionStore.ts
import create from 'zustand';

interface DetectionState {
  // 状态
  isRecording: boolean;
  waveformData: WaveformData[];
  probeStatus: ProbeStatus[];
  currentParameters: DetectionParameters;
  
  // 动作
  startRecording: () => void;
  stopRecording: () => void;
  updateWaveform: (data: WaveformData) => void;
  updateParameters: (params: Partial<DetectionParameters>) => void;
  resetState: () => void;
}

export const useDetectionStore = create<DetectionState>((set) => ({
  // 初始状态
  isRecording: false,
  waveformData: [],
  probeStatus: [
    { id: 1, status: 'offline' },
    { id: 2, status: 'offline' },
    { id: 3, status: 'offline' },
  ],
  currentParameters: defaultParameters,
  
  // 动作实现
  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),
  updateWaveform: (data) => set((state) => ({
    waveformData: [...state.waveformData, data]
  })),
  updateParameters: (params) => set((state) => ({
    currentParameters: { ...state.currentParameters, ...params }
  })),
  resetState: () => set({
    isRecording: false,
    waveformData: [],
    currentParameters: defaultParameters,
  }),
}));
```

## 3. 后端架构

### 3.1 Supabase配置

#### 3.1.1 数据库架构

**表设计原则**:
1. 遵循第三范式(3NF)
2. 使用UUID作为主键
3. 创建合适的索引
4. 设置外键约束
5. 使用触发器自动更新时间戳

**核心表结构**:

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('operator', 'engineer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 工件表
CREATE TABLE workpieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workpiece_no TEXT UNIQUE NOT NULL,
  material TEXT NOT NULL,
  dimensions JSONB NOT NULL,
  standard TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 检测记录表
CREATE TABLE detection_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workpiece_id UUID REFERENCES workpieces(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES users(id),
  detection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parameters JSONB NOT NULL,
  probe1_data JSONB,
  probe2_data JSONB,
  probe3_data JSONB,
  defects JSONB,
  conclusion TEXT,
  report_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_detection_records_workpiece ON detection_records(workpiece_id);
CREATE INDEX idx_detection_records_operator ON detection_records(operator_id);
CREATE INDEX idx_detection_records_date ON detection_records(detection_date DESC);
```

#### 3.1.2 Row Level Security (RLS)

```sql
-- 启用RLS
ALTER TABLE detection_records ENABLE ROW LEVEL SECURITY;

-- 操作员只能查看自己的记录
CREATE POLICY "Operators can view own records"
  ON detection_records
  FOR SELECT
  USING (auth.uid() = operator_id);

-- 工程师可以查看所有记录
CREATE POLICY "Engineers can view all records"
  ON detection_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- 只有管理员可以删除记录
CREATE POLICY "Only admins can delete records"
  ON detection_records
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 3.2 API设计

#### 3.2.1 Supabase客户端封装

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// 检测记录API
export const detectionAPI = {
  // 创建检测记录
  async createRecord(record: Omit<DetectionRecord, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('detection_records')
      .insert(record)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // 查询检测记录
  async getRecords(filters?: RecordFilters) {
    let query = supabase
      .from('detection_records')
      .select(`
        *,
        workpiece:workpieces(*),
        operator:users(*)
      `)
      .order('detection_date', { ascending: false });
    
    if (filters?.workpieceId) {
      query = query.eq('workpiece_id', filters.workpieceId);
    }
    
    if (filters?.startDate) {
      query = query.gte('detection_date', filters.startDate);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },
  
  // 更新检测记录
  async updateRecord(id: string, updates: Partial<DetectionRecord>) {
    const { data, error } = await supabase
      .from('detection_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // 删除检测记录
  async deleteRecord(id: string) {
    const { error } = await supabase
      .from('detection_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
```

## 4. 数据流

### 4.1 检测数据流

```
┌─────────────┐
│  硬件探头    │
│  (模拟数据)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  dataAcquisition    │  // 数据采集模块
│  - 采样            │
│  - 滤波            │
│  - 格式化          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  signalProcessing   │  // 信号处理模块
│  - 降噪            │
│  - FFT分析         │
│  - 特征提取        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  detectionStore     │  // 状态管理
│  - 更新波形数据     │
│  - 更新探头状态     │
└──────┬──────────────┘
       │
       ├───────────────────┐
       │                   │
       ▼                   ▼
┌──────────────┐    ┌─────────────┐
│ WaveformDisplay│    │  Supabase  │  // 数据持久化
│ (实时显示)    │    │  (保存)    │
└──────────────┘    └─────────────┘
```

### 4.2 用户交互流

```
用户操作 → 组件事件 → Store动作 → API调用 → Supabase → 更新UI
```

## 5. 安全架构

### 5.1 认证流程

```
1. 用户登录
   ↓
2. Supabase Auth验证
   ↓
3. 返回JWT Token
   ↓
4. 存储在localStorage
   ↓
5. 后续请求携带Token
   ↓
6. RLS验证权限
```

### 5.2 数据安全

1. **传输安全**: 全站HTTPS
2. **存储安全**: 敏感数据加密
3. **访问控制**: Row Level Security
4. **日志审计**: 操作日志记录

## 6. 监控和日志

### 6.1 前端监控

```typescript
// 性能监控
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('页面加载时间:', perfData.loadEventEnd);
});

// 错误监控
window.addEventListener('error', (event) => {
  logError({
    message: event.message,
    stack: event.error?.stack,
    timestamp: new Date().toISOString(),
  });
});
```

### 6.2 后端日志

```sql
-- 操作日志表
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 自动记录关键操作
CREATE OR REPLACE FUNCTION log_detection_record_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO system_logs (user_id, action, details)
  VALUES (
    auth.uid(),
    TG_OP || '_detection_record',
    jsonb_build_object('record_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER detection_record_audit
  AFTER INSERT OR UPDATE OR DELETE ON detection_records
  FOR EACH ROW EXECUTE FUNCTION log_detection_record_changes();
```

## 7. 部署架构

### 7.1 部署流程

```
开发环境 → GitHub → GitHub Actions → 构建 → Netlify → 生产环境
```

### 7.2 环境配置

**开发环境**:
- 本地开发服务器
- 开发数据库
- 开发API密钥

**生产环境**:
- Netlify CDN
- Supabase生产数据库
- 生产API密钥

---

**文档版本**: v1.0  
**创建日期**: 2025-10-05  
**维护人**: AI全栈开发团队
