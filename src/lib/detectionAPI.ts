/**
 * 检测相关API封装
 * 提供与Supabase数据库交互的接口
 */

import { supabase } from './supabase';
import type { DetectionRecord, WorkpieceInfo, ParameterTemplate, UserInfo } from '@/types/detection';

// ==================== 工件API ====================

export const workpieceAPI = {
  /**
   * 获取所有工件
   */
  async getAll() {
    const { data, error } = await supabase
      .from('mag_workpieces')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as WorkpieceInfo[];
  },
  
  /**
   * 根据ID获取工件
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('mag_workpieces')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as WorkpieceInfo;
  },
  
  /**
   * 创建工件
   */
  async create(workpiece: Omit<WorkpieceInfo, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('mag_workpieces')
      .insert(workpiece as never)
      .select()
      .single();
    
    if (error) throw error;
    return data as WorkpieceInfo;
  },
  
  /**
   * 更新工件
   */
  async update(id: string, updates: Partial<WorkpieceInfo>) {
    const { data, error } = await supabase
      .from('mag_workpieces')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as WorkpieceInfo;
  },
  
  /**
   * 删除工件
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('mag_workpieces')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ==================== 检测记录API ====================

export const detectionAPI = {
  /**
   * 获取所有检测记录
   */
  async getAll(limit: number = 50) {
    const { data, error } = await supabase
      .from('mag_detection_records')
      .select(`
        *,
        workpiece:mag_workpieces(*),
        operator:mag_users(*)
      `)
      .order('detection_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },
  
  /**
   * 根据ID获取检测记录
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('mag_detection_records')
      .select(`
        *,
        workpiece:mag_workpieces(*),
        operator:mag_users(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  /**
   * 根据工件ID获取检测记录
   */
  async getByWorkpieceId(workpieceId: string) {
    const { data, error } = await supabase
      .from('mag_detection_records')
      .select('*')
      .eq('workpiece_id', workpieceId)
      .order('detection_date', { ascending: false });
    
    if (error) throw error;
    return data as DetectionRecord[];
  },
  
  /**
   * 创建检测记录
   */
  async create(record: Omit<DetectionRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('mag_detection_records')
      .insert(record as never)
      .select()
      .single();
    
    if (error) throw error;
    return data as DetectionRecord;
  },
  
  /**
   * 更新检测记录
   */
  async update(id: string, updates: Partial<DetectionRecord>) {
    const { data, error } = await supabase
      .from('mag_detection_records')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DetectionRecord;
  },
  
  /**
   * 删除检测记录
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('mag_detection_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ==================== 参数模板API ====================

export const templateAPI = {
  /**
   * 获取所有模板
   */
  async getAll() {
    const { data, error } = await supabase
      .from('mag_parameter_templates')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ParameterTemplate[];
  },
  
  /**
   * 根据材料类型获取模板
   */
  async getByMaterialType(materialType: string) {
    const { data, error } = await supabase
      .from('mag_parameter_templates')
      .select('*')
      .eq('material_type', materialType);
    
    if (error) throw error;
    return data as ParameterTemplate[];
  },
  
  /**
   * 获取默认模板
   */
  async getDefault() {
    const { data, error } = await supabase
      .from('mag_parameter_templates')
      .select('*')
      .eq('is_default', true)
      .limit(1)
      .single();
    
    if (error) throw error;
    return data as ParameterTemplate;
  },
  
  /**
   * 创建模板
   */
  async create(template: Omit<ParameterTemplate, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('mag_parameter_templates')
      .insert(template as never)
      .select()
      .single();
    
    if (error) throw error;
    return data as ParameterTemplate;
  },
  
  /**
   * 更新模板
   */
  async update(id: string, updates: Partial<ParameterTemplate>) {
    const { data, error } = await supabase
      .from('mag_parameter_templates')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as ParameterTemplate;
  },
  
  /**
   * 删除模板
   */
  async delete(id: string) {
    const { error } = await supabase
      .from('mag_parameter_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// ==================== 用户API ====================

export const userAPI = {
  /**
   * 获取所有用户
   */
  async getAll() {
    const { data, error } = await supabase
      .from('mag_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as UserInfo[];
  },
  
  /**
   * 根据ID获取用户
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from('mag_users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as UserInfo;
  },
  
  /**
   * 更新用户信息
   */
  async update(id: string, updates: Partial<UserInfo>) {
    const { data, error } = await supabase
      .from('mag_users')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as UserInfo;
  },
};
