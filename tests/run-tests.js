/**
 * 测试运行器
 * 验证磁检测系统的主要功能
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🧪 磁检测系统功能测试\n');
console.log('='.repeat(50));

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   错误: ${error.message}`);
  }
}

// 测试1: 项目结构
test('项目结构完整性检查', () => {
  
  const requiredFiles = [
    'package.json',
    'astro.config.mjs',
    'tailwind.config.mjs',
    'tsconfig.json',
    'netlify.toml',
    'src/layouts/MainLayout.astro',
    'src/pages/index.astro',
    'src/pages/workpiece.astro',
    'src/pages/parameters.astro',
    'src/pages/history.astro',
    'src/pages/reports.astro',
    'src/stores/detectionStore.ts',
    'src/lib/supabase.ts',
    'src/lib/dataSimulator.ts',
    'src/lib/detectionAPI.ts',
    'src/types/database.ts',
    'src/types/detection.ts',
    'src/styles/global.css',
  ];
  
  const projectRoot = path.join(__dirname, '..');
  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(projectRoot, file))) {
      throw new Error(`缺少文件: ${file}`);
    }
  }
});

// 测试2: 配置文件有效性
test('配置文件有效性检查', () => {
  const projectRoot = path.join(__dirname, '..');
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8')
  );
  
  if (!packageJson.dependencies) {
    throw new Error('缺少dependencies配置');
  }
  
  const requiredDeps = ['astro', '@supabase/supabase-js', 'zustand', 'react'];
  for (const dep of requiredDeps) {
    if (!packageJson.dependencies[dep]) {
      throw new Error(`缺少依赖: ${dep}`);
    }
  }
});

// 测试3: TypeScript类型定义
test('TypeScript类型定义检查', () => {
  const projectRoot = path.join(__dirname, '..');
  const detectionTypes = fs.readFileSync(
    path.join(projectRoot, 'src/types/detection.ts'),
    'utf-8'
  );
  
  const requiredTypes = [
    'ProbeStatus',
    'ProbeConfig',
    'WaveformDataPoint',
    'DetectionParameters',
    'DefectInfo',
    'WorkpieceInfo',
    'DetectionRecord',
  ];
  
  for (const type of requiredTypes) {
    if (!detectionTypes.includes(type)) {
      throw new Error(`缺少类型定义: ${type}`);
    }
  }
});

// 测试4: 数据模拟器功能
test('数据模拟器功能检查', () => {
  const projectRoot = path.join(__dirname, '..');
  const simulatorCode = fs.readFileSync(
    path.join(projectRoot, 'src/lib/dataSimulator.ts'),
    'utf-8'
  );
  
  if (!simulatorCode.includes('DataSimulator')) {
    throw new Error('缺少DataSimulator类');
  }
  
  if (!simulatorCode.includes('generateWaveformData')) {
    throw new Error('缺少generateWaveformData函数');
  }
  
  if (!simulatorCode.includes('generateDefectWaveform')) {
    throw new Error('缺少generateDefectWaveform函数');
  }
});

// 测试5: API封装完整性
test('API封装完整性检查', () => {
  const projectRoot = path.join(__dirname, '..');
  const apiCode = fs.readFileSync(
    path.join(projectRoot, 'src/lib/detectionAPI.ts'),
    'utf-8'
  );
  
  const requiredAPIs = [
    'workpieceAPI',
    'detectionAPI',
    'templateAPI',
    'userAPI',
  ];
  
  for (const api of requiredAPIs) {
    if (!apiCode.includes(api)) {
      throw new Error(`缺少API: ${api}`);
    }
  }
});

// 测试6: 页面路由完整性
test('页面路由完整性检查', () => {
  const projectRoot = path.join(__dirname, '..');
  const pages = [
    'index.astro',
    'workpiece.astro',
    'parameters.astro',
    'history.astro',
    'reports.astro',
  ];
  
  for (const page of pages) {
    const pagePath = path.join(projectRoot, 'src/pages', page);
    if (!fs.existsSync(pagePath)) {
      throw new Error(`缺少页面: ${page}`);
    }
  }
});

// 测试7: 样式系统完整性
test('样式系统完整性检查', () => {
  const projectRoot = path.join(__dirname, '..');
  const globalCSS = fs.readFileSync(
    path.join(projectRoot, 'src/styles/global.css'),
    'utf-8'
  );
  
  const requiredClasses = [
    '.btn',
    '.input',
    '.panel',
    '.card',
    '.table',
    '.modal',
  ];
  
  for (const cls of requiredClasses) {
    if (!globalCSS.includes(cls)) {
      throw new Error(`缺少样式类: ${cls}`);
    }
  }
});

// 测试8: 数据库迁移脚本
test('数据库迁移脚本检查', () => {
  const projectRoot = path.join(__dirname, '..');
  const migrations = [
    '001_create_magnetic_detection_tables.sql',
    '002_enable_rls_and_policies.sql',
    '003_create_views_and_sample_data.sql',
  ];
  
  for (const migration of migrations) {
    const migrationPath = path.join(projectRoot, 'supabase/migrations', migration);
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`缺少迁移脚本: ${migration}`);
    }
  }
});

// 测试9: 文档完整性
test('文档完整性检查', () => {
  const projectRoot = path.join(__dirname, '..');
  const docs = [
    'README.md',
    'PRD.md',
    'PROJECT_SUMMARY.md',
    'DEVELOPMENT_COMPLETE.md',
    'docs/ARCHITECTURE.md',
    'docs/DATABASE.md',
    'docs/DATABASE_SETUP.md',
    'docs/DEPLOYMENT.md',
  ];
  
  for (const doc of docs) {
    if (!fs.existsSync(path.join(projectRoot, doc))) {
      throw new Error(`缺少文档: ${doc}`);
    }
  }
});

// 测试10: 环境配置
test('环境配置文档检查', () => {
  const projectRoot = path.join(__dirname, '..');
  
  // 检查是否有数据库设置文档
  const dbSetupPath = path.join(projectRoot, 'docs/DATABASE_SETUP.md');
  if (!fs.existsSync(dbSetupPath)) {
    throw new Error('缺少数据库设置文档');
  }
  
  const dbSetup = fs.readFileSync(dbSetupPath, 'utf-8');
  
  // 验证文档中包含环境配置说明
  if (!dbSetup.includes('PUBLIC_SUPABASE_URL')) {
    throw new Error('缺少Supabase URL配置说明');
  }
  
  if (!dbSetup.includes('PUBLIC_SUPABASE_ANON_KEY')) {
    throw new Error('缺少Supabase密钥配置说明');
  }
});

// 输出测试结果
console.log('='.repeat(50));
console.log(`\n📊 测试结果: ${passedTests}/${totalTests} 通过`);

if (passedTests === totalTests) {
  console.log('\n✅ 所有测试通过！项目状态良好！\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  有 ${totalTests - passedTests} 个测试失败\n`);
  process.exit(1);
}
