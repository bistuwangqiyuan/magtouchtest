# 数据库设置指南

## 概述

本文档说明如何设置磁检测系统的Supabase数据库。

## 前置条件

1. 拥有Supabase账号（https://supabase.com/）
2. 已创建Supabase项目

## 设置步骤

### 1. 获取Supabase配置信息

1. 登录Supabase控制台：https://app.supabase.com/
2. 选择你的项目
3. 进入 **Settings** > **API**
4. 记录以下信息：
   - **Project URL**: 你的Supabase项目URL
   - **anon/public key**: 公开API密钥

### 2. 配置环境变量

1. 复制`.env.example`文件为`.env`：
```bash
cp .env.example .env
```

2. 编辑`.env`文件，填入你的Supabase配置：
```env
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. 执行数据库迁移

由于MCP工具限制，需要手动执行数据库迁移SQL。

#### 方法1: 通过Supabase控制台（推荐）

1. 在Supabase控制台中，进入 **SQL Editor**
2. 按顺序执行以下迁移文件：

**步骤1: 创建表结构**
- 打开 `supabase/migrations/001_create_magnetic_detection_tables.sql`
- 复制全部内容
- 粘贴到SQL Editor
- 点击 **Run** 执行

**步骤2: 配置安全策略**
- 打开 `supabase/migrations/002_enable_rls_and_policies.sql`
- 复制全部内容
- 粘贴到SQL Editor
- 点击 **Run** 执行

**步骤3: 创建视图和示例数据**
- 打开 `supabase/migrations/003_create_views_and_sample_data.sql`
- 复制全部内容
- 粘贴到SQL Editor
- 点击 **Run** 执行

#### 方法2: 使用Supabase CLI（可选）

如果已安装Supabase CLI：

```bash
# 登录Supabase
supabase login

# 链接到你的项目
supabase link --project-ref your-project-ref

# 执行迁移
supabase db push
```

### 4. 验证数据库设置

执行完迁移后，在SQL Editor中运行以下查询验证：

```sql
-- 检查表是否创建成功
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'mag_%'
ORDER BY table_name;

-- 应该返回以下表：
-- mag_defect_images
-- mag_detection_records
-- mag_parameter_templates
-- mag_system_logs
-- mag_users
-- mag_workpieces

-- 检查示例用户是否插入成功
SELECT id, email, full_name, role FROM mag_users;

-- 检查示例工件是否插入成功
SELECT id, workpiece_no, material, status FROM mag_workpieces;

-- 检查参数模板是否插入成功
SELECT id, template_name, material_type, is_default FROM mag_parameter_templates;
```

### 5. 配置存储桶（用于文件上传）

磁检测系统需要存储缺陷图片和报告文件。

1. 在Supabase控制台中，进入 **Storage**
2. 点击 **New bucket** 创建以下存储桶：

#### 缺陷图片存储桶
- **Name**: `mag-defect-images`
- **Public**: ✓ (勾选，允许公开访问图片)
- **File size limit**: 10 MB
- **Allowed MIME types**: `image/*`

#### 报告文件存储桶
- **Name**: `mag-reports`
- **Public**: ✓ (勾选，允许下载报告)
- **File size limit**: 20 MB
- **Allowed MIME types**: `application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

3. 配置存储策略（Storage Policies）：

进入每个存储桶的**Policies**标签，添加以下策略：

**上传策略**（登录用户可上传）：
```sql
-- mag-defect-images bucket
CREATE POLICY "Authenticated users can upload defect images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mag-defect-images');

-- mag-reports bucket
CREATE POLICY "Authenticated users can upload reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mag-reports');
```

**下载策略**（所有人可下载）：
```sql
-- mag-defect-images bucket
CREATE POLICY "Anyone can download defect images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mag-defect-images');

-- mag-reports bucket
CREATE POLICY "Anyone can download reports"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mag-reports');
```

## 数据库结构说明

### 核心表

1. **mag_users** - 用户表
   - 存储系统用户信息
   - 角色：operator（操作员）、engineer（工程师）、admin（管理员）

2. **mag_workpieces** - 工件表
   - 存储待检测工件信息
   - 状态：pending（待检测）、in_progress（检测中）、completed（已完成）

3. **mag_detection_records** - 检测记录表
   - 存储检测记录和结果
   - 包含三探头数据、缺陷信息、检测结论

4. **mag_parameter_templates** - 参数模板表
   - 存储检测参数模板
   - 支持公共模板和私有模板

5. **mag_defect_images** - 缺陷图片表
   - 存储缺陷图片元数据
   - 实际图片文件存储在Supabase Storage

6. **mag_system_logs** - 系统日志表
   - 记录所有重要操作
   - 用于审计和追溯

### 视图

1. **mag_detection_records_detail** - 检测记录详情视图
   - 包含完整的工件和操作员信息

2. **mag_detection_statistics** - 检测统计视图
   - 按天统计检测数据

3. **mag_user_activity_stats** - 用户活动统计视图
   - 统计每个用户的检测活动

## 安全策略（RLS）

所有表都启用了Row Level Security（行级安全），确保：

- 操作员只能查看和修改自己的数据
- 工程师可以查看所有数据，修改大部分数据
- 管理员拥有完全权限
- 所有操作都会被记录到系统日志

## 示例数据

迁移脚本会自动插入以下示例数据：

### 用户
- admin@example.com (管理员)
- engineer@example.com (工程师)
- operator1@example.com (操作员1)
- operator2@example.com (操作员2)

### 工件
- WP-2025-001 (316L不锈钢压力容器)
- WP-2025-002 (Q345钢板)
- WP-2025-003 (铝合金6061)

### 参数模板
- 不锈钢标准模板
- Q345钢板模板
- 铝合金模板

### 检测记录
- 一条示例检测记录（包含2处缺陷）

## 故障排查

### 问题1: 迁移执行失败

**解决方案**:
1. 检查是否有语法错误
2. 确保按顺序执行迁移文件
3. 查看Supabase日志获取详细错误信息

### 问题2: RLS策略导致无法访问数据

**解决方案**:
1. 确保用户已正确登录（auth.uid()有值）
2. 检查用户角色是否正确
3. 暂时禁用RLS进行测试：`ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

### 问题3: 存储桶上传失败

**解决方案**:
1. 检查存储策略是否正确配置
2. 确认文件大小和类型符合限制
3. 检查用户是否已登录

## 数据备份

### 自动备份

Supabase会自动进行每日备份，保留7天。

### 手动备份

1. 在Supabase控制台，进入 **Database** > **Backups**
2. 点击 **Create backup** 手动创建备份点

### 导出数据

```sql
-- 导出所有检测记录（CSV格式）
COPY (SELECT * FROM mag_detection_records) TO '/tmp/detection_records.csv' CSV HEADER;

-- 导出工件信息
COPY (SELECT * FROM mag_workpieces) TO '/tmp/workpieces.csv' CSV HEADER;
```

## 性能优化建议

1. **定期清理旧日志**
```sql
-- 删除30天前的系统日志
DELETE FROM mag_system_logs WHERE created_at < NOW() - INTERVAL '30 days';
```

2. **分析查询性能**
```sql
-- 使用EXPLAIN ANALYZE查看查询计划
EXPLAIN ANALYZE 
SELECT * FROM mag_detection_records_detail 
WHERE detection_date > NOW() - INTERVAL '7 days';
```

3. **添加自定义索引**（根据实际查询模式）
```sql
-- 示例：为工件编号的模糊搜索添加索引
CREATE INDEX idx_mag_workpieces_no_pattern ON mag_workpieces USING gin (workpiece_no gin_trgm_ops);
```

## 后续步骤

数据库设置完成后，继续以下步骤：

1. 配置环境变量（`.env`文件）
2. 安装项目依赖：`pnpm install`
3. 启动开发服务器：`pnpm dev`
4. 访问 http://localhost:4321

## 参考资源

- [Supabase官方文档](https://supabase.com/docs)
- [PostgreSQL文档](https://www.postgresql.org/docs/)
- [Row Level Security指南](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage指南](https://supabase.com/docs/guides/storage)

---

**文档版本**: v1.0  
**最后更新**: 2025-10-05  
**维护人**: AI全栈开发团队
