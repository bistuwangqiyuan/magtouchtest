/**
 * Supabase客户端配置
 * 提供数据库和存储访问接口
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// 从环境变量获取配置
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// 验证配置
if (!supabaseUrl) {
  throw new Error('Missing environment variable: PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: PUBLIC_SUPABASE_ANON_KEY');
}

// 创建Supabase客户端
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ==================== 类型导出 ====================

export type SupabaseClient = typeof supabase;

// ==================== 存储桶配置 ====================

export const STORAGE_BUCKETS = {
  DEFECT_IMAGES: 'mag-defect-images',
  REPORTS: 'mag-reports',
} as const;

// ==================== 辅助函数 ====================

/**
 * 获取存储文件的公开URL
 * @param bucket 存储桶名称
 * @param path 文件路径
 * @returns 公开访问URL
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * 上传文件到存储桶
 * @param bucket 存储桶名称
 * @param path 文件路径
 * @param file 文件对象
 * @returns 上传结果
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string; error: Error | null }> {
  try {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      throw error;
    }

    const url = getPublicUrl(bucket, path);
    return { url, error: null };
  } catch (error) {
    console.error('Upload file error:', error);
    return { url: '', error: error as Error };
  }
}

/**
 * 删除存储桶中的文件
 * @param bucket 存储桶名称
 * @param path 文件路径
 * @returns 删除结果
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete file error:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * 批量删除文件
 * @param bucket 存储桶名称
 * @param paths 文件路径数组
 * @returns 删除结果
 */
export async function deleteFiles(
  bucket: string,
  paths: string[]
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove(paths);

    if (error) {
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Delete files error:', error);
    return { success: false, error: error as Error };
  }
}

// ==================== 认证辅助函数 ====================

/**
 * 获取当前登录用户
 * @returns 用户对象或null
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * 检查用户是否登录
 * @returns 是否登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * 登出
 * @returns 登出结果
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as Error };
  }
}
