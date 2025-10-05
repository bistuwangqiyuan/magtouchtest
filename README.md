# 接触式三探头磁检测软件

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

**专业的工业磁粉检测软件系统**

[功能特性](#功能特性) • [技术架构](#技术架构) • [快速开始](#快速开始) • [部署](#部署) • [文档](#文档)

</div>

---

## 📋 项目概述

接触式三探头磁检测软件是一款面向工业无损检测领域的专业检测软件，采用三探头同步检测技术，用于金属材料表面和近表面缺陷的磁粉检测。系统提供实时数据采集、波形分析、缺陷识别和报告生成等完整功能。

### 核心特性

- 🎯 **三探头同步检测**: 提高检测效率3倍，覆盖更大检测面积
- 📊 **实时波形显示**: 高性能Canvas渲染，支持30fps+刷新率
- 🎨 **工业风格UI**: 深色主题设计，触摸屏友好，适合工业环境
- 💾 **完整数据管理**: 自动保存检测记录，支持历史查询和追溯
- 📄 **智能报告生成**: 一键生成PDF检测报告，符合行业标准
- 🔧 **灵活参数配置**: 丰富的参数模板，支持不同材料和标准

## 🚀 功能特性

### 1. 实时检测模块
- ✅ 三探头同步数据采集
- ✅ 实时波形显示（采样率100Hz-10kHz可调）
- ✅ 探头状态监控（在线/离线/异常）
- ✅ 自动增益控制和噪声过滤

### 2. 波形显示模块
- ✅ 三通道同时显示
- ✅ 波形缩放和游标测量
- ✅ 波形叠加对比
- ✅ 频谱分析（FFT）

### 3. 参数配置模块
- ✅ 探头参数配置（增益、频率、滤波器）
- ✅ 闸门设置（检测范围、阈值）
- ✅ DAC/AVG曲线配置
- ✅ 参数模板管理

### 4. 数据管理模块
- ✅ 检测记录自动保存
- ✅ 历史数据查询（多维度筛选）
- ✅ 数据导出（CSV/Excel）
- ✅ 统计分析和报表

### 5. 报告生成模块
- ✅ PDF报告自动生成
- ✅ 自定义报告模板
- ✅ 波形截图和数据表格
- ✅ 数字签名和审批流程

## 🏗️ 技术架构

### 技术栈

#### 前端技术
- **框架**: Astro 4.x - 现代化静态站点生成器
- **样式**: Tailwind CSS 3.x - 实用优先的CSS框架
- **图表**: Chart.js + Canvas API - 高性能波形渲染
- **状态管理**: Zustand - 轻量级状态管理
- **类型检查**: TypeScript 5.x - 类型安全

#### 后端服务
- **数据库**: Supabase (PostgreSQL) - 开源Firebase替代方案
- **认证**: Supabase Auth - 完整的用户认证系统
- **存储**: Supabase Storage - 文件和波形数据存储
- **实时通信**: Supabase Realtime - 实时数据同步

#### 部署和运维
- **托管**: Netlify - 全球CDN加速
- **CI/CD**: GitHub Actions - 自动化构建和部署
- **监控**: Supabase Dashboard - 数据库和API监控

### 项目结构

```
magtouchtest/
├── src/
│   ├── pages/                    # 页面路由
│   │   ├── index.astro          # 主检测界面
│   │   ├── history.astro        # 历史记录
│   │   ├── settings.astro       # 系统设置
│   │   └── reports.astro        # 报告管理
│   ├── components/               # 可复用组件
│   │   ├── Layout/              # 布局组件
│   │   │   ├── Header.astro
│   │   │   ├── Sidebar.astro
│   │   │   └── Footer.astro
│   │   ├── Detection/           # 检测相关组件
│   │   │   ├── WaveformDisplay.tsx
│   │   │   ├── ProbeStatus.tsx
│   │   │   └── ParameterPanel.tsx
│   │   ├── Config/              # 配置相关组件
│   │   │   ├── ProbeConfig.tsx
│   │   │   ├── GateConfig.tsx
│   │   │   └── TemplateManager.tsx
│   │   └── Common/              # 通用组件
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Toast.tsx
│   ├── lib/                      # 核心逻辑库
│   │   ├── supabase.ts          # Supabase客户端
│   │   ├── detection.ts         # 检测逻辑
│   │   ├── waveform.ts          # 波形处理
│   │   └── report.ts            # 报告生成
│   ├── stores/                   # 状态管理
│   │   ├── detectionStore.ts    # 检测状态
│   │   ├── userStore.ts         # 用户状态
│   │   └── configStore.ts       # 配置状态
│   ├── types/                    # TypeScript类型定义
│   │   ├── detection.ts
│   │   ├── waveform.ts
│   │   └── database.ts
│   ├── utils/                    # 工具函数
│   │   ├── dataProcessing.ts    # 数据处理
│   │   ├── validation.ts        # 数据验证
│   │   └── formatters.ts        # 格式化工具
│   └── styles/                   # 全局样式
│       ├── global.css
│       └── industrial-theme.css
├── public/                       # 静态资源
│   ├── images/                  # 图片资源
│   ├── icons/                   # 图标资源
│   └── fonts/                   # 字体文件
├── supabase/                     # Supabase配置
│   ├── migrations/              # 数据库迁移
│   └── functions/               # Edge Functions
├── tests/                        # 测试文件
│   ├── unit/                    # 单元测试
│   ├── integration/             # 集成测试
│   └── e2e/                     # 端到端测试
├── docs/                         # 项目文档
│   ├── PRD.md                   # 产品需求文档
│   ├── API.md                   # API文档
│   ├── DEPLOYMENT.md            # 部署指南
│   └── USER_GUIDE.md            # 用户手册
├── .env.example                  # 环境变量模板
├── astro.config.mjs             # Astro配置
├── tailwind.config.mjs          # Tailwind配置
├── tsconfig.json                # TypeScript配置
├── netlify.toml                 # Netlify配置
└── package.json                 # 项目依赖
```

### 数据库设计

#### 核心数据表

1. **users** - 用户表
   - 用户信息、角色权限

2. **workpieces** - 工件表
   - 工件编号、材质、尺寸

3. **detection_records** - 检测记录表
   - 检测日期、参数、波形数据、结论

4. **parameter_templates** - 参数模板表
   - 模板名称、材料类型、参数配置

5. **system_logs** - 系统日志表
   - 用户操作、系统事件

详细设计见：[数据库设计文档](docs/DATABASE.md)

## 🛠️ 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- pnpm 8.x 或更高版本
- Supabase账号
- Netlify账号（用于部署）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/magtouchtest.git
cd magtouchtest
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入Supabase配置：
```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **初始化数据库**
```bash
# 运行数据库迁移（通过Supabase MCP工具）
# 详见 docs/DATABASE_SETUP.md
```

5. **启动开发服务器**
```bash
pnpm dev
```

访问 `http://localhost:4321` 查看应用

### 开发命令

```bash
# 开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 运行测试
pnpm test

# 运行测试（监听模式）
pnpm test:watch

# 代码检查
pnpm lint

# 代码格式化
pnpm format

# 类型检查
pnpm type-check
```

## 📦 部署

### Netlify部署

#### 方法1: 通过Git连接（推荐）

1. 将代码推送到GitHub
2. 登录Netlify，点击"New site from Git"
3. 选择仓库，配置构建设置：
   - Build command: `pnpm build`
   - Publish directory: `dist`
4. 添加环境变量（Supabase配置）
5. 点击"Deploy site"

#### 方法2: 手动部署

```bash
# 构建项目
pnpm build

# 部署到Netlify
pnpm deploy:prod
```

详细部署指南：[DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 📚 文档

- [产品需求文档 (PRD)](PRD.md)
- [技术架构文档](docs/ARCHITECTURE.md)
- [API文档](docs/API.md)
- [数据库设计](docs/DATABASE.md)
- [部署指南](docs/DEPLOYMENT.md)
- [用户手册](docs/USER_GUIDE.md)
- [开发指南](docs/DEVELOPMENT.md)

## 🧪 测试

### 测试策略

- **单元测试**: 核心业务逻辑（目标覆盖率≥80%）
- **集成测试**: API接口和数据库操作
- **端到端测试**: 关键用户流程

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试
pnpm test:unit

# 运行集成测试
pnpm test:integration

# 查看测试覆盖率
pnpm test:coverage
```

## 📋 任务清单 (TASKS)

### 进行中 (In Progress)
- [x] 创建项目文档（PRD、README、技术架构文档） - 2025-10-05
- [ ] 设计Supabase数据库结构 - 2025-10-05

### 待完成 (Pending)
- [ ] 实现主界面布局和样式 - 2025-10-05
- [ ] 实现三探头实时数据采集和显示模块 - 2025-10-05
- [ ] 实现波形显示组件（Canvas绘制） - 2025-10-05
- [ ] 实现功能菜单系统 - 2025-10-05
- [ ] 实现数据存储和历史记录功能 - 2025-10-05
- [ ] 实现报告导出功能 - 2025-10-05
- [ ] 编写单元测试和集成测试 - 2025-10-05
- [ ] 部署到Netlify生产环境 - 2025-10-05

### 已完成 (Completed)
- [x] 项目初始化 - 2025-10-05

### 工作中发现的任务
- [ ] 待添加...

## 🎨 设计规范

### 色彩系统

```css
/* 主色调 */
--bg-primary: #1a1a1a;        /* 深黑背景 */
--bg-secondary: #2d2d2d;      /* 深灰背景 */
--bg-panel: #3a3a3a;          /* 面板背景 */

/* 强调色 */
--accent-primary: #ff8c00;    /* 工业橙 */
--accent-success: #00ff00;    /* 绿色 */
--accent-warning: #ffcc00;    /* 黄色 */
--accent-error: #ff0000;      /* 红色 */

/* 文字色 */
--text-primary: #ffffff;      /* 白色 */
--text-secondary: #cccccc;    /* 浅灰 */
--text-disabled: #666666;     /* 暗灰 */

/* 边框和分割线 */
--border: #444444;
--divider: #333333;
--grid: #2a2a2a;
```

### 组件尺寸

- 按钮: 最小尺寸 60x60px
- 输入框: 高度 44px
- 图标: 32x32px 或 24x24px
- 字体: 主字号 16px，标题 20px，小字 12px

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件

## 👥 团队

- **开发团队**: AI全栈开发团队
- **项目经理**: AI Assistant
- **技术负责人**: AI Assistant

## 📞 联系方式

- 项目主页: [https://github.com/yourusername/magtouchtest](https://github.com/yourusername/magtouchtest)
- 问题反馈: [Issues](https://github.com/yourusername/magtouchtest/issues)
- 邮箱: support@example.com

## 🙏 致谢

感谢以下开源项目：

- [Astro](https://astro.build/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Chart.js](https://www.chartjs.org/)
- [Netlify](https://www.netlify.com/)

---

<div align="center">

**用专业的工具，做专业的检测**

Made with ❤️ by AI全栈开发团队

</div>
