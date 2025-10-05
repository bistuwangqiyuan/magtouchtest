# 数据库设计文档

## 1. 数据库概述

### 1.1 数据库选型
- **数据库**: PostgreSQL 15.x (通过Supabase)
- **ORM**: Supabase Client SDK
- **迁移工具**: Supabase Migrations

### 1.2 设计原则
1. 遵循第三范式(3NF)，减少数据冗余
2. 使用UUID作为主键，便于分布式系统
3. 合理使用JSONB存储灵活数据
4. 创建适当的索引优化查询
5. 使用触发器自动维护时间戳
6. 实施Row Level Security保护数据

## 2. 数据模型设计

### 2.1 ER图

```
┌──────────────┐
│    users     │
│──────────────│
│ id (PK)      │◀────────┐
│ email        │         │
│ full_name    │         │
│ role         │         │
│ avatar_url   │         │
│ phone        │         │
│ created_at   │         │
│ updated_at   │         │
└──────────────┘         │
                         │
                         │ operator_id (FK)
                         │
┌──────────────┐         │
│ workpieces   │         │
│──────────────│         │
│ id (PK)      │◀────┐   │
│ workpiece_no │     │   │
│ material     │     │   │
│ dimensions   │     │   │
│ standard     │     │   │
│ description  │     │   │
│ image_url    │     │   │
│ created_at   │     │   │
│ updated_at   │     │ workpiece_id (FK)
└──────────────┘     │   │
                     │   │
                     └───┼───────────────┐
                         │               │
                         │               │
                  ┌──────────────────────┴─┐
                  │  detection_records     │
                  │────────────────────────│
                  │ id (PK)                │
                  │ workpiece_id (FK)      │
                  │ operator_id (FK)       │
                  │ detection_date         │
                  │ parameters             │◀───┐
                  │ probe1_data            │    │
                  │ probe2_data            │    │
                  │ probe3_data            │    │
                  │ defects                │    │
                  │ conclusion             │    │
                  │ report_url             │    │
                  │ status                 │    │
                  │ created_at             │    │
                  │ updated_at             │    │
                  └────────────────────────┘    │
                                                │ record_id (FK)
                                                │
┌──────────────────┐                            │
│ parameter_       │                            │
│ templates        │                            │
│──────────────────│                            │
│ id (PK)          │                            │
│ template_name    │                            │
│ material_type    │                            │
│ parameters       │                            │
│ is_default       │                            │
│ created_by (FK)  │                            │
│ created_at       │                            │
│ updated_at       │                            │
└──────────────────┘                            │
                                                │
┌──────────────────┐                            │
│ defect_images    │                            │
│──────────────────│                            │
│ id (PK)          │                            │
│ record_id (FK)   ├────────────────────────────┘
│ image_url        │
│ description      │
│ position         │
│ created_at       │
└──────────────────┘

┌──────────────────┐
│ system_logs      │
│──────────────────│
│ id (PK)          │
│ user_id (FK)     │
│ action           │
│ details          │
│ ip_address       │
│ user_agent       │
│ created_at       │
└──────────────────┘
```

## 3. 表结构详细设计

### 3.1 users (用户表)

**表说明**: 存储系统用户信息

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('operator', 'engineer', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 注释
COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.id IS '用户ID';
COMMENT ON COLUMN users.email IS '邮箱地址';
COMMENT ON COLUMN users.full_name IS '用户全名';
COMMENT ON COLUMN users.role IS '用户角色: operator(操作员)/engineer(工程师)/admin(管理员)';
COMMENT ON COLUMN users.avatar_url IS '头像URL';
COMMENT ON COLUMN users.phone IS '联系电话';
COMMENT ON COLUMN users.is_active IS '是否激活';
COMMENT ON COLUMN users.last_login_at IS '最后登录时间';
```

**字段说明**:

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PK | 用户ID |
| email | TEXT | UNIQUE, NOT NULL | 邮箱地址 |
| full_name | TEXT | NOT NULL | 用户全名 |
| role | TEXT | NOT NULL, CHECK | 用户角色 |
| avatar_url | TEXT | NULL | 头像URL |
| phone | TEXT | NULL | 联系电话 |
| is_active | BOOLEAN | DEFAULT TRUE | 是否激活 |
| last_login_at | TIMESTAMP | NULL | 最后登录时间 |
| created_at | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 更新时间 |

**角色权限**:
- `operator`: 操作员 - 执行检测、查看自己的记录
- `engineer`: 工程师 - 所有操作员权限 + 查看所有记录、配置参数
- `admin`: 管理员 - 所有权限 + 用户管理、系统配置

### 3.2 workpieces (工件表)

**表说明**: 存储待检测工件信息

```sql
CREATE TABLE workpieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workpiece_no TEXT UNIQUE NOT NULL,
  material TEXT NOT NULL,
  dimensions JSONB NOT NULL,
  standard TEXT,
  description TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_workpieces_no ON workpieces(workpiece_no);
CREATE INDEX idx_workpieces_material ON workpieces(material);
CREATE INDEX idx_workpieces_status ON workpieces(status);

-- 注释
COMMENT ON TABLE workpieces IS '工件表';
COMMENT ON COLUMN workpieces.workpiece_no IS '工件编号';
COMMENT ON COLUMN workpieces.material IS '材质';
COMMENT ON COLUMN workpieces.dimensions IS '尺寸信息(JSON)';
COMMENT ON COLUMN workpieces.standard IS '检测标准';
COMMENT ON COLUMN workpieces.description IS '描述';
COMMENT ON COLUMN workpieces.status IS '状态: pending(待检测)/in_progress(检测中)/completed(已完成)';
```

**dimensions字段格式**:
```json
{
  "length": 1000,      // 长度(mm)
  "width": 500,        // 宽度(mm)
  "thickness": 20,     // 厚度(mm)
  "weight": 15.5,      // 重量(kg)
  "unit": "mm"         // 单位
}
```

### 3.3 detection_records (检测记录表)

**表说明**: 存储检测记录和结果

```sql
CREATE TABLE detection_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workpiece_id UUID NOT NULL REFERENCES workpieces(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  detection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parameters JSONB NOT NULL,
  probe1_data JSONB,
  probe2_data JSONB,
  probe3_data JSONB,
  defects JSONB,
  conclusion TEXT,
  report_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'approved')),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_detection_records_workpiece ON detection_records(workpiece_id);
CREATE INDEX idx_detection_records_operator ON detection_records(operator_id);
CREATE INDEX idx_detection_records_date ON detection_records(detection_date DESC);
CREATE INDEX idx_detection_records_status ON detection_records(status);

-- 全文搜索索引
CREATE INDEX idx_detection_records_conclusion ON detection_records USING GIN (to_tsvector('chinese', conclusion));

-- 注释
COMMENT ON TABLE detection_records IS '检测记录表';
COMMENT ON COLUMN detection_records.workpiece_id IS '工件ID';
COMMENT ON COLUMN detection_records.operator_id IS '操作员ID';
COMMENT ON COLUMN detection_records.parameters IS '检测参数(JSON)';
COMMENT ON COLUMN detection_records.probe1_data IS '探头1数据(JSON)';
COMMENT ON COLUMN detection_records.defects IS '缺陷信息(JSON)';
COMMENT ON COLUMN detection_records.conclusion IS '检测结论';
COMMENT ON COLUMN detection_records.status IS '状态: draft(草稿)/completed(完成)/approved(已审批)';
```

**parameters字段格式**:
```json
{
  "probe1": {
    "gain": 45.5,           // 增益(dB)
    "frequency": 5.0,       // 频率(MHz)
    "filter": "bandpass",   // 滤波器类型
    "threshold": 50         // 阈值(%)
  },
  "probe2": { /* ... */ },
  "probe3": { /* ... */ },
  "gate": {
    "gateA": {
      "start": 0,           // 起始位置(mm)
      "width": 100,         // 宽度(mm)
      "threshold": 60       // 阈值(%)
    },
    "gateB": { /* ... */ }
  },
  "system": {
    "samplingRate": 1000,   // 采样率(Hz)
    "averageCount": 16,     // 平均次数
    "detectionMode": "full" // 检波模式
  }
}
```

**probe_data字段格式**:
```json
{
  "waveform": [0.1, 0.2, 0.15, ...],  // 波形数据数组
  "peaks": [                           // 峰值信息
    {
      "position": 25.5,                // 位置(mm)
      "amplitude": 0.85,               // 幅度(V)
      "isPeak": true                   // 是否为峰值
    }
  ],
  "statistics": {
    "max": 0.95,                       // 最大值
    "min": 0.05,                       // 最小值
    "average": 0.45,                   // 平均值
    "stdDev": 0.15                     // 标准差
  }
}
```

**defects字段格式**:
```json
[
  {
    "id": "defect_001",
    "type": "crack",                    // 缺陷类型: crack(裂纹)/porosity(气孔)/inclusion(夹杂)
    "position": {
      "x": 125.5,                       // X坐标(mm)
      "y": 50.3,                        // Y坐标(mm)
      "depth": 2.5                      // 深度(mm)
    },
    "size": {
      "length": 15.2,                   // 长度(mm)
      "width": 0.5                      // 宽度(mm)
    },
    "severity": "medium",               // 严重程度: low/medium/high/critical
    "probe": 1,                         // 检测探头
    "description": "表面横向裂纹",
    "imageUrl": "/storage/defect_001.png"
  }
]
```

### 3.4 parameter_templates (参数模板表)

**表说明**: 存储检测参数模板

```sql
CREATE TABLE parameter_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name TEXT NOT NULL,
  material_type TEXT NOT NULL,
  standard TEXT,
  parameters JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_templates_material ON parameter_templates(material_type);
CREATE INDEX idx_templates_created_by ON parameter_templates(created_by);

-- 注释
COMMENT ON TABLE parameter_templates IS '参数模板表';
COMMENT ON COLUMN parameter_templates.template_name IS '模板名称';
COMMENT ON COLUMN parameter_templates.material_type IS '适用材料类型';
COMMENT ON COLUMN parameter_templates.standard IS '依据标准';
COMMENT ON COLUMN parameter_templates.is_default IS '是否默认模板';
COMMENT ON COLUMN parameter_templates.is_public IS '是否公开模板';
```

### 3.5 defect_images (缺陷图片表)

**表说明**: 存储缺陷图片和标注

```sql
CREATE TABLE defect_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID NOT NULL REFERENCES detection_records(id) ON DELETE CASCADE,
  defect_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  position JSONB,
  annotations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_defect_images_record ON defect_images(record_id);

-- 注释
COMMENT ON TABLE defect_images IS '缺陷图片表';
COMMENT ON COLUMN defect_images.defect_id IS '缺陷ID';
COMMENT ON COLUMN defect_images.annotations IS '标注信息(JSON)';
```

### 3.6 system_logs (系统日志表)

**表说明**: 记录系统操作日志

```sql
CREATE TABLE system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  status TEXT CHECK (status IN ('success', 'failure')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_logs_user ON system_logs(user_id);
CREATE INDEX idx_logs_action ON system_logs(action);
CREATE INDEX idx_logs_created ON system_logs(created_at DESC);

-- 注释
COMMENT ON TABLE system_logs IS '系统日志表';
COMMENT ON COLUMN system_logs.action IS '操作类型';
COMMENT ON COLUMN system_logs.resource_type IS '资源类型';
COMMENT ON COLUMN system_logs.resource_id IS '资源ID';
```

## 4. 触发器和函数

### 4.1 自动更新时间戳

```sql
-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加触发器
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workpieces_updated_at
  BEFORE UPDATE ON workpieces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_detection_records_updated_at
  BEFORE UPDATE ON detection_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON parameter_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 自动记录操作日志

```sql
-- 创建日志记录函数
CREATE OR REPLACE FUNCTION log_important_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO system_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details,
    status
  ) VALUES (
    auth.uid(),
    TG_OP || '_' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    'success'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 为关键表添加日志触发器
CREATE TRIGGER log_detection_records_changes
  AFTER INSERT OR UPDATE OR DELETE ON detection_records
  FOR EACH ROW EXECUTE FUNCTION log_important_changes();

CREATE TRIGGER log_workpieces_changes
  AFTER INSERT OR UPDATE OR DELETE ON workpieces
  FOR EACH ROW EXECUTE FUNCTION log_important_changes();
```

### 4.3 更新工件状态

```sql
-- 根据检测记录自动更新工件状态
CREATE OR REPLACE FUNCTION update_workpiece_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 当创建新检测记录时，将工件状态设为"检测中"
  IF TG_OP = 'INSERT' THEN
    UPDATE workpieces
    SET status = 'in_progress'
    WHERE id = NEW.workpiece_id AND status = 'pending';
  END IF;
  
  -- 当检测记录完成时，检查是否所有检测都完成
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' THEN
    UPDATE workpieces
    SET status = 'completed'
    WHERE id = NEW.workpiece_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_workpiece_status
  AFTER INSERT OR UPDATE ON detection_records
  FOR EACH ROW EXECUTE FUNCTION update_workpiece_status();
```

## 5. Row Level Security (RLS)

### 5.1 用户表RLS

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的信息
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- 管理员可以查看所有用户
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 用户可以更新自己的信息（除了role）
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()));

-- 只有管理员可以插入和删除用户
CREATE POLICY "Only admins can insert users"
  ON users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 5.2 检测记录RLS

```sql
ALTER TABLE detection_records ENABLE ROW LEVEL SECURITY;

-- 操作员可以查看自己的记录
CREATE POLICY "Operators can view own records"
  ON detection_records FOR SELECT
  USING (auth.uid() = operator_id);

-- 工程师和管理员可以查看所有记录
CREATE POLICY "Engineers can view all records"
  ON detection_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- 操作员可以创建记录
CREATE POLICY "Operators can create records"
  ON detection_records FOR INSERT
  WITH CHECK (auth.uid() = operator_id);

-- 操作员可以更新自己的草稿记录
CREATE POLICY "Operators can update own draft records"
  ON detection_records FOR UPDATE
  USING (auth.uid() = operator_id AND status = 'draft')
  WITH CHECK (auth.uid() = operator_id);

-- 工程师可以更新所有记录
CREATE POLICY "Engineers can update all records"
  ON detection_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- 只有管理员可以删除记录
CREATE POLICY "Only admins can delete records"
  ON detection_records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 6. 视图

### 6.1 检测记录详情视图

```sql
CREATE VIEW detection_records_detail AS
SELECT 
  dr.id,
  dr.detection_date,
  dr.conclusion,
  dr.status,
  dr.created_at,
  w.workpiece_no,
  w.material,
  w.dimensions,
  u.full_name AS operator_name,
  u.email AS operator_email,
  dr.parameters,
  jsonb_build_object(
    'probe1', dr.probe1_data,
    'probe2', dr.probe2_data,
    'probe3', dr.probe3_data
  ) AS probe_data,
  dr.defects,
  (SELECT COUNT(*) FROM jsonb_array_elements(dr.defects)) AS defect_count,
  dr.report_url
FROM detection_records dr
LEFT JOIN workpieces w ON dr.workpiece_id = w.id
LEFT JOIN users u ON dr.operator_id = u.id;

COMMENT ON VIEW detection_records_detail IS '检测记录详情视图';
```

### 6.2 统计视图

```sql
CREATE VIEW detection_statistics AS
SELECT 
  DATE_TRUNC('day', detection_date) AS detection_day,
  COUNT(*) AS total_records,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_records,
  COUNT(*) FILTER (WHERE conclusion LIKE '%合格%') AS passed_records,
  COUNT(*) FILTER (WHERE conclusion LIKE '%不合格%') AS failed_records,
  AVG((SELECT COUNT(*) FROM jsonb_array_elements(defects))) AS avg_defects_per_record
FROM detection_records
GROUP BY DATE_TRUNC('day', detection_date)
ORDER BY detection_day DESC;

COMMENT ON VIEW detection_statistics IS '检测统计视图';
```

## 7. 索引优化建议

### 7.1 复合索引

```sql
-- 检测记录的复合查询索引
CREATE INDEX idx_detection_records_composite 
  ON detection_records(workpiece_id, operator_id, detection_date DESC);

-- 工件编号和状态的复合索引
CREATE INDEX idx_workpieces_no_status 
  ON workpieces(workpiece_no, status);
```

### 7.2 部分索引

```sql
-- 只索引未完成的工件
CREATE INDEX idx_workpieces_pending 
  ON workpieces(status) 
  WHERE status IN ('pending', 'in_progress');

-- 只索引草稿状态的检测记录
CREATE INDEX idx_detection_records_draft 
  ON detection_records(operator_id, updated_at) 
  WHERE status = 'draft';
```

## 8. 数据备份策略

### 8.1 备份计划

1. **每日备份**: 全量备份数据库（Supabase自动）
2. **实时备份**: 使用WAL日志实现点恢复
3. **异地备份**: 定期导出关键数据到云存储

### 8.2 备份SQL

```sql
-- 导出检测记录（最近30天）
COPY (
  SELECT * FROM detection_records
  WHERE detection_date >= NOW() - INTERVAL '30 days'
) TO '/backup/detection_records_30days.csv' WITH CSV HEADER;

-- 导出工件信息
COPY workpieces TO '/backup/workpieces.csv' WITH CSV HEADER;
```

## 9. 性能优化

### 9.1 查询优化示例

```sql
-- 优化前：查询工件的所有检测记录
SELECT * FROM detection_records WHERE workpiece_id = 'xxx';

-- 优化后：只查询需要的字段
SELECT id, detection_date, conclusion, status 
FROM detection_records 
WHERE workpiece_id = 'xxx'
ORDER BY detection_date DESC
LIMIT 10;

-- 使用物化视图缓存统计结果
CREATE MATERIALIZED VIEW mv_detection_statistics AS
SELECT 
  operator_id,
  DATE_TRUNC('month', detection_date) AS month,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count
FROM detection_records
GROUP BY operator_id, DATE_TRUNC('month', detection_date);

-- 创建索引
CREATE INDEX idx_mv_statistics_operator ON mv_detection_statistics(operator_id);

-- 定期刷新物化视图
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_detection_statistics;
```

---

**文档版本**: v1.0  
**创建日期**: 2025-10-05  
**维护人**: AI全栈开发团队
