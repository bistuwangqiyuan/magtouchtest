-- 启用Row Level Security并创建安全策略
-- 作者: AI全栈开发团队
-- 日期: 2025-10-05
-- 项目: 接触式三探头磁检测软件

-- ==================== 用户表RLS ====================
ALTER TABLE mag_users ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的信息
CREATE POLICY "mag_users_can_view_own_profile"
  ON mag_users FOR SELECT
  USING (auth.uid() = id);

-- 工程师和管理员可以查看所有用户
CREATE POLICY "mag_engineers_can_view_all_users"
  ON mag_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- 用户可以更新自己的信息（除了role）
CREATE POLICY "mag_users_can_update_own_profile"
  ON mag_users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM mag_users WHERE id = auth.uid()));

-- 只有管理员可以插入和删除用户
CREATE POLICY "mag_only_admins_can_insert_users"
  ON mag_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "mag_only_admins_can_delete_users"
  ON mag_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== 工件表RLS ====================
ALTER TABLE mag_workpieces ENABLE ROW LEVEL SECURITY;

-- 所有登录用户可以查看工件
CREATE POLICY "mag_authenticated_users_can_view_workpieces"
  ON mag_workpieces FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 操作员及以上可以创建工件
CREATE POLICY "mag_operators_can_create_workpieces"
  ON mag_workpieces FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 工程师和管理员可以更新工件
CREATE POLICY "mag_engineers_can_update_workpieces"
  ON mag_workpieces FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- 只有管理员可以删除工件
CREATE POLICY "mag_only_admins_can_delete_workpieces"
  ON mag_workpieces FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== 检测记录表RLS ====================
ALTER TABLE mag_detection_records ENABLE ROW LEVEL SECURITY;

-- 操作员可以查看自己的记录
CREATE POLICY "mag_operators_can_view_own_records"
  ON mag_detection_records FOR SELECT
  USING (auth.uid() = operator_id);

-- 工程师和管理员可以查看所有记录
CREATE POLICY "mag_engineers_can_view_all_records"
  ON mag_detection_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- 操作员可以创建记录
CREATE POLICY "mag_operators_can_create_records"
  ON mag_detection_records FOR INSERT
  WITH CHECK (auth.uid() = operator_id);

-- 操作员可以更新自己的草稿记录
CREATE POLICY "mag_operators_can_update_own_draft_records"
  ON mag_detection_records FOR UPDATE
  USING (auth.uid() = operator_id AND status = 'draft')
  WITH CHECK (auth.uid() = operator_id);

-- 工程师可以更新所有记录
CREATE POLICY "mag_engineers_can_update_all_records"
  ON mag_detection_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- 只有管理员可以删除记录
CREATE POLICY "mag_only_admins_can_delete_records"
  ON mag_detection_records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==================== 参数模板表RLS ====================
ALTER TABLE mag_parameter_templates ENABLE ROW LEVEL SECURITY;

-- 所有用户可以查看公共模板
CREATE POLICY "mag_users_can_view_public_templates"
  ON mag_parameter_templates FOR SELECT
  USING (is_public = TRUE OR created_by = auth.uid());

-- 用户可以查看自己创建的私有模板
CREATE POLICY "mag_users_can_view_own_private_templates"
  ON mag_parameter_templates FOR SELECT
  USING (created_by = auth.uid());

-- 工程师及以上可以创建模板
CREATE POLICY "mag_engineers_can_create_templates"
  ON mag_parameter_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- 用户可以更新自己创建的模板
CREATE POLICY "mag_users_can_update_own_templates"
  ON mag_parameter_templates FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- 用户可以删除自己创建的模板
CREATE POLICY "mag_users_can_delete_own_templates"
  ON mag_parameter_templates FOR DELETE
  USING (created_by = auth.uid());

-- ==================== 缺陷图片表RLS ====================
ALTER TABLE mag_defect_images ENABLE ROW LEVEL SECURITY;

-- 所有有权查看检测记录的用户可以查看对应的缺陷图片
CREATE POLICY "mag_users_can_view_images_of_accessible_records"
  ON mag_defect_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mag_detection_records dr
      WHERE dr.id = mag_defect_images.record_id 
      AND (dr.operator_id = auth.uid() OR EXISTS (
        SELECT 1 FROM mag_users
        WHERE id = auth.uid() AND role IN ('engineer', 'admin')
      ))
    )
  );

-- 检测记录的创建者可以添加缺陷图片
CREATE POLICY "mag_record_operators_can_add_images"
  ON mag_defect_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mag_detection_records
      WHERE id = mag_defect_images.record_id AND operator_id = auth.uid()
    )
  );

-- 工程师和管理员可以删除缺陷图片
CREATE POLICY "mag_engineers_can_delete_images"
  ON mag_defect_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role IN ('engineer', 'admin')
    )
  );

-- ==================== 系统日志表RLS ====================
ALTER TABLE mag_system_logs ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的日志
CREATE POLICY "mag_users_can_view_own_logs"
  ON mag_system_logs FOR SELECT
  USING (user_id = auth.uid());

-- 管理员可以查看所有日志
CREATE POLICY "mag_admins_can_view_all_logs"
  ON mag_system_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mag_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 系统自动插入日志（通过触发器）
CREATE POLICY "mag_allow_system_log_insert"
  ON mag_system_logs FOR INSERT
  WITH CHECK (TRUE);
