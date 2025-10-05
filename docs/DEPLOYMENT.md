# 部署指南

## 概述

本文档说明如何将磁检测系统部署到Netlify生产环境。

## 前置条件

1. ✅ 已完成Supabase数据库设置（参见 [DATABASE_SETUP.md](DATABASE_SETUP.md)）
2. ✅ 已配置环境变量（`.env`文件）
3. ✅ 已安装依赖：`pnpm install`
4. ✅ 本地测试通过：`pnpm dev`

## 部署方式

### 方式1: 通过Git连接（推荐）

这是最推荐的方式，可以实现自动化部署。

#### 步骤1: 推送代码到GitHub

```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 磁检测系统"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/yourusername/magtouchtest.git

# 推送到GitHub
git push -u origin main
```

#### 步骤2: 连接Netlify

1. 登录Netlify: https://app.netlify.com/
2. 点击 **New site from Git**
3. 选择 **GitHub** 并授权
4. 选择仓库 `magtouchtest`
5. 配置构建设置：
   - **Branch to deploy**: `main`
   - **Build command**: `pnpm build`
   - **Publish directory**: `dist`
6. 点击 **Show advanced** 添加环境变量：
   ```
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
7. 点击 **Deploy site**

#### 步骤3: 配置自定义域名（可选）

1. 在Netlify控制台，进入 **Domain settings**
2. 点击 **Add custom domain**
3. 输入你的域名（例如：`mag-detection.com`）
4. 按照提示配置DNS记录

### 方式2: 使用Netlify CLI

#### 步骤1: 安装Netlify CLI

```bash
pnpm add -g netlify-cli
```

#### 步骤2: 登录Netlify

```bash
netlify login
```

这会打开浏览器，完成授权后返回终端。

#### 步骤3: 初始化站点

```bash
# 如果是新站点
netlify init

# 如果已有站点，链接到现有站点
netlify link
```

按照提示操作：
- 选择 **Create & configure a new site**
- 选择团队
- 输入站点名称（例如：`mag-detection-system`）

#### 步骤4: 部署

**首次部署（需要先构建）**:
```bash
# 构建项目
pnpm build

# 部署（不构建，使用已构建的dist目录）
netlify deploy --prod --no-build
```

**后续部署**:
```bash
# 分步执行
pnpm deploy:build   # 构建
pnpm deploy:only    # 部署
```

或者一步执行（不推荐，因为可能超时）:
```bash
pnpm deploy
```

### 方式3: 手动上传（不推荐）

仅用于临时测试或应急情况。

#### 步骤1: 构建项目

```bash
pnpm build
```

#### 步骤2: 上传到Netlify

1. 登录Netlify控制台
2. 进入 **Sites** > **Drag and drop your site**
3. 将 `dist` 文件夹拖拽到上传区域
4. 等待部署完成

## 环境变量配置

在Netlify控制台配置以下环境变量：

### 必需的环境变量

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `PUBLIC_SUPABASE_URL` | Supabase项目URL | `https://xxxxx.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名密钥 | `eyJhbG...` |

### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 环境模式 | `production` |
| `PUBLIC_APP_NAME` | 应用名称 | `磁检测系统` |

配置路径：**Site settings** > **Environment variables**

## 部署验证

部署完成后，进行以下验证：

### 1. 基本访问测试

```bash
# 访问站点URL
curl https://your-site.netlify.app/
```

应该返回200状态码和HTML内容。

### 2. 功能测试清单

- [ ] 页面正常加载
- [ ] 样式正确应用（工业风格）
- [ ] 波形显示区域正常
- [ ] 探头状态显示
- [ ] 按钮可点击
- [ ] Supabase连接正常

### 3. 性能测试

使用Lighthouse测试：
```bash
# 安装lighthouse
npm install -g lighthouse

# 运行测试
lighthouse https://your-site.netlify.app/ --view
```

目标指标：
- Performance: ≥90
- Accessibility: ≥95
- Best Practices: ≥90
- SEO: ≥90

## 常见问题

### Q1: 构建失败 - "Module not found"

**原因**: 依赖未正确安装

**解决方案**:
```bash
# 清除缓存并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Q2: 部署后页面空白

**原因**: 环境变量未配置

**解决方案**:
1. 检查Netlify环境变量是否正确配置
2. 检查Supabase URL和密钥是否有效
3. 查看浏览器控制台错误信息

### Q3: 部署超时

**原因**: 构建时间过长或网络问题

**解决方案**:
- 使用分步部署：先 `pnpm build`，再 `netlify deploy --prod --no-build`
- 检查网络连接
- 减小构建包大小

### Q4: CSS样式未生效

**原因**: Tailwind CSS未正确配置或缓存问题

**解决方案**:
```bash
# 清除构建缓存
rm -rf .astro dist

# 重新构建
pnpm build
```

### Q5: Supabase连接失败

**原因**: RLS策略或环境变量问题

**解决方案**:
1. 检查Supabase环境变量是否正确
2. 确认RLS策略已正确配置
3. 在浏览器控制台查看详细错误信息

## 监控和日志

### Netlify部署日志

查看部署日志：
1. 进入Netlify控制台
2. 选择站点
3. 点击 **Deploys** 标签
4. 选择具体的部署，查看日志

### 实时日志（Functions）

如果使用Netlify Functions：
```bash
netlify functions:log function-name --stream
```

### 浏览器控制台

生产环境问题调试：
1. 打开浏览器开发者工具 (F12)
2. 查看 **Console** 标签页
3. 查看 **Network** 标签页，检查API请求

## 回滚部署

如果新部署出现问题，可以快速回滚：

### 通过Netlify控制台

1. 进入 **Deploys** 标签
2. 找到上一个稳定版本
3. 点击 **Publish deploy**

### 通过Netlify CLI

```bash
# 列出最近的部署
netlify deploys:list

# 回滚到指定部署
netlify rollback deploy-id
```

## 持续集成/持续部署 (CI/CD)

如果使用Git连接方式，每次推送到main分支会自动触发部署。

### GitHub Actions示例

创建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
        env:
          PUBLIC_SUPABASE_URL: ${{ secrets.PUBLIC_SUPABASE_URL }}
          PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PUBLIC_SUPABASE_ANON_KEY }}
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-deploy: ${{ github.ref == 'refs/heads/main' }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 性能优化建议

### 1. 启用Gzip压缩

Netlify自动启用，无需配置。

### 2. 配置缓存

已在 `netlify.toml` 中配置，静态资源缓存1年。

### 3. 使用CDN

Netlify自带全球CDN，自动启用。

### 4. 图片优化

- 使用WebP格式
- 压缩图片
- 使用响应式图片

### 5. 代码分割

Astro已自动进行代码分割，可在 `astro.config.mjs` 中进一步优化。

## 安全检查清单

部署前确保：

- [ ] 敏感信息已移至环境变量
- [ ] .env 文件已添加到 .gitignore
- [ ] Supabase RLS策略已启用
- [ ] 安全头部已配置（netlify.toml）
- [ ] HTTPS已启用（Netlify自动）
- [ ] 依赖包无已知漏洞：`pnpm audit`

## 下一步

部署成功后：

1. 📊 配置监控和告警
2. 🔍 设置Google Analytics或其他分析工具
3. 📱 测试移动端兼容性
4. 🧪 进行压力测试
5. 📖 更新用户文档

## 参考资源

- [Netlify官方文档](https://docs.netlify.com/)
- [Astro部署指南](https://docs.astro.build/en/guides/deploy/netlify/)
- [Supabase文档](https://supabase.com/docs)

---

**文档版本**: v1.0  
**最后更新**: 2025-10-05  
**维护人**: AI全栈开发团队
