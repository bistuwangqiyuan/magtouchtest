-- 创建视图和插入示例数据
-- 作者: AI全栈开发团队
-- 日期: 2025-10-05
-- 项目: 接触式三探头磁检测软件

-- ==================== 视图 ====================

-- 检测记录详情视图
CREATE OR REPLACE VIEW mag_detection_records_detail AS
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
FROM mag_detection_records dr
LEFT JOIN mag_workpieces w ON dr.workpiece_id = w.id
LEFT JOIN mag_users u ON dr.operator_id = u.id;

COMMENT ON VIEW mag_detection_records_detail IS '磁检测记录详情视图 - 包含完整的工件和操作员信息';

-- 检测统计视图
CREATE OR REPLACE VIEW mag_detection_statistics AS
SELECT 
  DATE_TRUNC('day', detection_date) AS detection_day,
  COUNT(*) AS total_records,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_records,
  COUNT(*) FILTER (WHERE conclusion LIKE '%合格%') AS passed_records,
  COUNT(*) FILTER (WHERE conclusion LIKE '%不合格%') AS failed_records,
  AVG((SELECT COUNT(*) FROM jsonb_array_elements(defects))) AS avg_defects_per_record
FROM mag_detection_records
GROUP BY DATE_TRUNC('day', detection_date)
ORDER BY detection_day DESC;

COMMENT ON VIEW mag_detection_statistics IS '磁检测统计视图 - 按天统计检测数据';

-- 用户活动统计视图
CREATE OR REPLACE VIEW mag_user_activity_stats AS
SELECT 
  u.id,
  u.full_name,
  u.email,
  u.role,
  COUNT(dr.id) AS total_detections,
  COUNT(dr.id) FILTER (WHERE dr.status = 'completed') AS completed_detections,
  MAX(dr.detection_date) AS last_detection_date,
  u.last_login_at
FROM mag_users u
LEFT JOIN mag_detection_records dr ON u.id = dr.operator_id
GROUP BY u.id, u.full_name, u.email, u.role, u.last_login_at
ORDER BY total_detections DESC;

COMMENT ON VIEW mag_user_activity_stats IS '用户活动统计视图 - 统计每个用户的检测活动';

-- ==================== 示例数据 ====================

-- 插入示例用户
INSERT INTO mag_users (id, email, full_name, role, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com', '系统管理员', 'admin', TRUE),
  ('22222222-2222-2222-2222-222222222222', 'engineer@example.com', '张工程师', 'engineer', TRUE),
  ('33333333-3333-3333-3333-333333333333', 'operator1@example.com', '李操作员', 'operator', TRUE),
  ('44444444-4444-4444-4444-444444444444', 'operator2@example.com', '王操作员', 'operator', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 插入示例工件
INSERT INTO mag_workpieces (id, workpiece_no, material, dimensions, standard, description, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'WP-2025-001', '316L不锈钢', 
   '{"length": 1000, "width": 500, "thickness": 20, "weight": 78.5, "unit": "mm"}'::jsonb,
   'GB/T 15822-2019', '压力容器焊缝检测', 'pending'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'WP-2025-002', 'Q345钢板', 
   '{"length": 2000, "width": 1000, "thickness": 30, "weight": 471.0, "unit": "mm"}'::jsonb,
   'ASTM E1444-16', '桥梁钢板质量检测', 'pending'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'WP-2025-003', '铝合金6061', 
   '{"length": 800, "width": 400, "thickness": 15, "weight": 12.96, "unit": "mm"}'::jsonb,
   'EN ISO 9934-1', '航空部件检测', 'pending')
ON CONFLICT (id) DO NOTHING;

-- 插入示例参数模板
INSERT INTO mag_parameter_templates (id, template_name, material_type, standard, parameters, is_default, is_public, created_by, description) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '不锈钢标准模板', '316L不锈钢', 'GB/T 15822-2019',
   '{
     "probe1": {"gain": 45.5, "frequency": 5.0, "filter": "bandpass", "threshold": 50},
     "probe2": {"gain": 45.5, "frequency": 5.0, "filter": "bandpass", "threshold": 50},
     "probe3": {"gain": 45.5, "frequency": 5.0, "filter": "bandpass", "threshold": 50},
     "gate": {
       "gateA": {"start": 0, "width": 100, "threshold": 60},
       "gateB": {"start": 100, "width": 100, "threshold": 60}
     },
     "system": {
       "samplingRate": 1000,
       "averageCount": 16,
       "detectionMode": "full"
     }
   }'::jsonb,
   TRUE, TRUE, '22222222-2222-2222-2222-222222222222', '适用于316L不锈钢的标准检测参数'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Q345钢板模板', 'Q345钢', 'ASTM E1444-16',
   '{
     "probe1": {"gain": 48.0, "frequency": 5.0, "filter": "bandpass", "threshold": 55},
     "probe2": {"gain": 48.0, "frequency": 5.0, "filter": "bandpass", "threshold": 55},
     "probe3": {"gain": 48.0, "frequency": 5.0, "filter": "bandpass", "threshold": 55},
     "gate": {
       "gateA": {"start": 0, "width": 120, "threshold": 65},
       "gateB": {"start": 120, "width": 120, "threshold": 65}
     },
     "system": {
       "samplingRate": 1200,
       "averageCount": 32,
       "detectionMode": "full"
     }
   }'::jsonb,
   TRUE, TRUE, '22222222-2222-2222-2222-222222222222', '适用于Q345钢板的标准检测参数'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '铝合金模板', '铝合金', 'EN ISO 9934-1',
   '{
     "probe1": {"gain": 42.0, "frequency": 7.5, "filter": "bandpass", "threshold": 45},
     "probe2": {"gain": 42.0, "frequency": 7.5, "filter": "bandpass", "threshold": 45},
     "probe3": {"gain": 42.0, "frequency": 7.5, "filter": "bandpass", "threshold": 45},
     "gate": {
       "gateA": {"start": 0, "width": 80, "threshold": 55},
       "gateB": {"start": 80, "width": 80, "threshold": 55}
     },
     "system": {
       "samplingRate": 800,
       "averageCount": 8,
       "detectionMode": "full"
     }
   }'::jsonb,
   TRUE, TRUE, '22222222-2222-2222-2222-222222222222', '适用于铝合金的标准检测参数')
ON CONFLICT (id) DO NOTHING;

-- 插入一条示例检测记录
INSERT INTO mag_detection_records (
  id, 
  workpiece_id, 
  operator_id, 
  detection_date,
  parameters,
  probe1_data,
  probe2_data,
  probe3_data,
  defects,
  conclusion,
  status
) VALUES (
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '33333333-3333-3333-3333-333333333333',
  NOW(),
  '{
    "probe1": {"gain": 45.5, "frequency": 5.0, "filter": "bandpass", "threshold": 50},
    "probe2": {"gain": 45.5, "frequency": 5.0, "filter": "bandpass", "threshold": 50},
    "probe3": {"gain": 45.5, "frequency": 5.0, "filter": "bandpass", "threshold": 50},
    "gate": {
      "gateA": {"start": 0, "width": 100, "threshold": 60},
      "gateB": {"start": 100, "width": 100, "threshold": 60}
    },
    "system": {
      "samplingRate": 1000,
      "averageCount": 16,
      "detectionMode": "full"
    }
  }'::jsonb,
  '{
    "waveform": [0.1, 0.15, 0.2, 0.18, 0.12, 0.08],
    "peaks": [
      {"position": 25.5, "amplitude": 0.85, "isPeak": true},
      {"position": 75.2, "amplitude": 0.62, "isPeak": true}
    ],
    "statistics": {"max": 0.95, "min": 0.05, "average": 0.45, "stdDev": 0.15}
  }'::jsonb,
  '{
    "waveform": [0.12, 0.16, 0.19, 0.17, 0.11, 0.09],
    "peaks": [
      {"position": 28.3, "amplitude": 0.78, "isPeak": true}
    ],
    "statistics": {"max": 0.88, "min": 0.06, "average": 0.42, "stdDev": 0.14}
  }'::jsonb,
  '{
    "waveform": [0.09, 0.14, 0.21, 0.19, 0.13, 0.07],
    "peaks": [
      {"position": 30.1, "amplitude": 0.91, "isPeak": true}
    ],
    "statistics": {"max": 0.92, "min": 0.04, "average": 0.47, "stdDev": 0.16}
  }'::jsonb,
  '[
    {
      "id": "defect_001",
      "type": "crack",
      "position": {"x": 125.5, "y": 50.3, "depth": 2.5},
      "size": {"length": 15.2, "width": 0.5},
      "severity": "medium",
      "probe": 1,
      "description": "表面横向裂纹"
    },
    {
      "id": "defect_002",
      "type": "porosity",
      "position": {"x": 285.8, "y": 120.6, "depth": 1.2},
      "size": {"length": 3.5, "width": 3.0},
      "severity": "low",
      "probe": 2,
      "description": "小型气孔"
    }
  ]'::jsonb,
  '检测发现2处缺陷，其中1处为中等严重度裂纹，1处为轻微气孔。建议进行修补处理。',
  'completed'
) ON CONFLICT (id) DO NOTHING;
