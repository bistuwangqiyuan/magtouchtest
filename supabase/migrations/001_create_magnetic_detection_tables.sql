-- 创建磁检测系统的基础表结构
-- 作者: AI全栈开发团队
-- 日期: 2025-10-05
-- 项目: 接触式三探头磁检测软件
-- 说明: 请通过Supabase控制台的SQL编辑器执行此迁移

-- ==================== 1. 用户表 ====================
CREATE TABLE IF NOT EXISTS mag_users (
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

-- 创建索引
CREATE INDEX idx_mag_users_email ON mag_users(email);
CREATE INDEX idx_mag_users_role ON mag_users(role);

-- 添加注释
COMMENT ON TABLE mag_users IS '磁检测系统用户表';
COMMENT ON COLUMN mag_users.role IS '用户角色: operator(操作员)/engineer(工程师)/admin(管理员)';

-- ==================== 2. 工件表 ====================
CREATE TABLE IF NOT EXISTS mag_workpieces (
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

-- 创建索引
CREATE INDEX idx_mag_workpieces_no ON mag_workpieces(workpiece_no);
CREATE INDEX idx_mag_workpieces_material ON mag_workpieces(material);
CREATE INDEX idx_mag_workpieces_status ON mag_workpieces(status);

-- 添加注释
COMMENT ON TABLE mag_workpieces IS '磁检测工件表';
COMMENT ON COLUMN mag_workpieces.dimensions IS '尺寸信息JSON格式: {length, width, thickness, weight, unit}';
COMMENT ON COLUMN mag_workpieces.status IS '状态: pending(待检测)/in_progress(检测中)/completed(已完成)';

-- ==================== 3. 检测记录表 ====================
CREATE TABLE IF NOT EXISTS mag_detection_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workpiece_id UUID NOT NULL REFERENCES mag_workpieces(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES mag_users(id) ON DELETE SET NULL,
  detection_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parameters JSONB NOT NULL,
  probe1_data JSONB,
  probe2_data JSONB,
  probe3_data JSONB,
  defects JSONB,
  conclusion TEXT,
  report_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'approved')),
  approved_by UUID REFERENCES mag_users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_mag_detection_records_workpiece ON mag_detection_records(workpiece_id);
CREATE INDEX idx_mag_detection_records_operator ON mag_detection_records(operator_id);
CREATE INDEX idx_mag_detection_records_date ON mag_detection_records(detection_date DESC);
CREATE INDEX idx_mag_detection_records_status ON mag_detection_records(status);

-- 添加注释
COMMENT ON TABLE mag_detection_records IS '磁检测记录表';
COMMENT ON COLUMN mag_detection_records.parameters IS '检测参数JSON: {probe1-3配置, gate配置, 系统配置}';
COMMENT ON COLUMN mag_detection_records.probe1_data IS '探头1波形数据JSON: {waveform数组, peaks, statistics}';
COMMENT ON COLUMN mag_detection_records.defects IS '缺陷信息JSON数组: [{type, position, size, severity}]';

-- ==================== 4. 参数模板表 ====================
CREATE TABLE IF NOT EXISTS mag_parameter_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name TEXT NOT NULL,
  material_type TEXT NOT NULL,
  standard TEXT,
  parameters JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES mag_users(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_mag_templates_material ON mag_parameter_templates(material_type);
CREATE INDEX idx_mag_templates_created_by ON mag_parameter_templates(created_by);

-- 添加注释
COMMENT ON TABLE mag_parameter_templates IS '磁检测参数模板表';
COMMENT ON COLUMN mag_parameter_templates.is_default IS '是否为默认模板';
COMMENT ON COLUMN mag_parameter_templates.is_public IS '是否为公共模板（所有用户可见）';

-- ==================== 5. 缺陷图片表 ====================
CREATE TABLE IF NOT EXISTS mag_defect_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id UUID NOT NULL REFERENCES mag_detection_records(id) ON DELETE CASCADE,
  defect_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  description TEXT,
  position JSONB,
  annotations JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_mag_defect_images_record ON mag_defect_images(record_id);

-- 添加注释
COMMENT ON TABLE mag_defect_images IS '磁检测缺陷图片表';
COMMENT ON COLUMN mag_defect_images.annotations IS '图片标注信息JSON';

-- ==================== 6. 系统日志表 ====================
CREATE TABLE IF NOT EXISTS mag_system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES mag_users(id) ON DELETE SET NULL,
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

-- 创建索引
CREATE INDEX idx_mag_logs_user ON mag_system_logs(user_id);
CREATE INDEX idx_mag_logs_action ON mag_system_logs(action);
CREATE INDEX idx_mag_logs_created ON mag_system_logs(created_at DESC);

-- 添加注释
COMMENT ON TABLE mag_system_logs IS '磁检测系统日志表';
COMMENT ON COLUMN mag_system_logs.action IS '操作类型: create/update/delete/login/logout等';

-- ==================== 触发器函数 ====================

-- 自动更新updated_at时间戳
CREATE OR REPLACE FUNCTION mag_update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有表添加触发器
CREATE TRIGGER mag_update_users_updated_at
  BEFORE UPDATE ON mag_users
  FOR EACH ROW EXECUTE FUNCTION mag_update_updated_at_column();

CREATE TRIGGER mag_update_workpieces_updated_at
  BEFORE UPDATE ON mag_workpieces
  FOR EACH ROW EXECUTE FUNCTION mag_update_updated_at_column();

CREATE TRIGGER mag_update_detection_records_updated_at
  BEFORE UPDATE ON mag_detection_records
  FOR EACH ROW EXECUTE FUNCTION mag_update_updated_at_column();

CREATE TRIGGER mag_update_templates_updated_at
  BEFORE UPDATE ON mag_parameter_templates
  FOR EACH ROW EXECUTE FUNCTION mag_update_updated_at_column();

-- 自动记录重要操作日志
CREATE OR REPLACE FUNCTION mag_log_important_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO mag_system_logs (
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
CREATE TRIGGER mag_log_detection_records_changes
  AFTER INSERT OR UPDATE OR DELETE ON mag_detection_records
  FOR EACH ROW EXECUTE FUNCTION mag_log_important_changes();

CREATE TRIGGER mag_log_workpieces_changes
  AFTER INSERT OR UPDATE OR DELETE ON mag_workpieces
  FOR EACH ROW EXECUTE FUNCTION mag_log_important_changes();

-- 根据检测记录自动更新工件状态
CREATE OR REPLACE FUNCTION mag_update_workpiece_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 当创建新检测记录时，将工件状态设为"检测中"
  IF TG_OP = 'INSERT' THEN
    UPDATE mag_workpieces
    SET status = 'in_progress'
    WHERE id = NEW.workpiece_id AND status = 'pending';
  END IF;
  
  -- 当检测记录完成时，更新工件状态为"已完成"
  IF TG_OP = 'UPDATE' AND NEW.status = 'completed' THEN
    UPDATE mag_workpieces
    SET status = 'completed'
    WHERE id = NEW.workpiece_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mag_auto_update_workpiece_status
  AFTER INSERT OR UPDATE ON mag_detection_records
  FOR EACH ROW EXECUTE FUNCTION mag_update_workpiece_status();
