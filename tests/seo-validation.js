/**
 * SEO验证测试脚本
 * 全面检查SEO优化实施情况
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试结果统计
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// 测试函数
function test(name, condition, message) {
  results.total++;
  if (condition) {
    results.passed++;
    results.details.push({ name, status: '✅ PASS', message });
    console.log(`✅ PASS: ${name}`);
  } else {
    results.failed++;
    results.details.push({ name, status: '❌ FAIL', message });
    console.log(`❌ FAIL: ${name} - ${message}`);
  }
}

console.log('\n🔍 开始SEO验证测试...\n');
console.log('='.repeat(60));

// ==================== 1. 文件存在性检查 ====================
console.log('\n📁 1. 文件存在性检查');
console.log('-'.repeat(60));

const files = [
  'public/robots.txt',
  'public/sitemap.xml',
  'public/site.webmanifest',
  'public/favicon.svg',
  'public/favicon-16x16.png',
  'public/favicon-32x32.png',
  'public/apple-touch-icon.png',
  'public/android-chrome-192x192.png',
  'public/android-chrome-512x512.png',
  'public/images/og-image.png',
  'src/components/SEO.astro',
  'src/components/Breadcrumb.astro',
  'netlify.toml'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  const exists = fs.existsSync(filePath);
  test(`${file} 存在`, exists, `文件不存在: ${file}`);
});

// ==================== 2. robots.txt 验证 ====================
console.log('\n🤖 2. robots.txt 验证');
console.log('-'.repeat(60));

const robotsPath = path.join(__dirname, '..', 'public', 'robots.txt');
if (fs.existsSync(robotsPath)) {
  const robotsContent = fs.readFileSync(robotsPath, 'utf-8');
  
  test('robots.txt 包含 User-agent', robotsContent.includes('User-agent:'), 'User-agent未定义');
  test('robots.txt 包含 Allow', robotsContent.includes('Allow:'), 'Allow规则缺失');
  test('robots.txt 包含 Sitemap', robotsContent.includes('Sitemap:'), 'Sitemap位置未声明');
  test('robots.txt 包含正确域名', robotsContent.includes('magtouchtest.netlify.app'), '域名配置错误');
  test('robots.txt 包含中文搜索引擎', 
    robotsContent.includes('Baiduspider') && robotsContent.includes('360Spider'), 
    '中文搜索引擎未配置');
}

// ==================== 3. sitemap.xml 验证 ====================
console.log('\n🗺️  3. sitemap.xml 验证');
console.log('-'.repeat(60));

const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  
  test('sitemap.xml 格式正确', sitemapContent.includes('<?xml version="1.0"'), 'XML声明缺失');
  test('sitemap.xml 包含urlset', sitemapContent.includes('<urlset'), 'urlset标签缺失');
  test('sitemap.xml 包含首页', sitemapContent.includes('https://magtouchtest.netlify.app/'), '首页URL缺失');
  test('sitemap.xml 包含所有页面', 
    sitemapContent.includes('/workpiece') && 
    sitemapContent.includes('/parameters') && 
    sitemapContent.includes('/history') && 
    sitemapContent.includes('/reports'), 
    '部分页面URL缺失');
  test('sitemap.xml 包含lastmod', sitemapContent.includes('<lastmod>'), 'lastmod标签缺失');
  test('sitemap.xml 包含priority', sitemapContent.includes('<priority>'), 'priority标签缺失');
  test('sitemap.xml 包含changefreq', sitemapContent.includes('<changefreq>'), 'changefreq标签缺失');
  test('sitemap.xml 包含图片信息', sitemapContent.includes('image:image'), '图片信息缺失');
}

// ==================== 4. site.webmanifest 验证 ====================
console.log('\n📱 4. site.webmanifest 验证');
console.log('-'.repeat(60));

const manifestPath = path.join(__dirname, '..', 'public', 'site.webmanifest');
if (fs.existsSync(manifestPath)) {
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(manifestContent);
  
  test('manifest 包含 name', !!manifest.name, 'name字段缺失');
  test('manifest 包含 short_name', !!manifest.short_name, 'short_name字段缺失');
  test('manifest 包含 description', !!manifest.description, 'description字段缺失');
  test('manifest 包含 start_url', !!manifest.start_url, 'start_url字段缺失');
  test('manifest 包含 display', !!manifest.display, 'display字段缺失');
  test('manifest 包含 theme_color', !!manifest.theme_color, 'theme_color字段缺失');
  test('manifest 包含 background_color', !!manifest.background_color, 'background_color字段缺失');
  test('manifest 包含 icons', manifest.icons && manifest.icons.length > 0, 'icons数组为空');
  test('manifest icons包含多尺寸', manifest.icons && manifest.icons.length >= 3, 'icons数量不足');
}

// ==================== 5. SEO组件验证 ====================
console.log('\n🔖 5. SEO组件验证');
console.log('-'.repeat(60));

const seoPath = path.join(__dirname, '..', 'src', 'components', 'SEO.astro');
if (fs.existsSync(seoPath)) {
  const seoContent = fs.readFileSync(seoPath, 'utf-8');
  
  test('SEO组件包含 Meta标签', seoContent.includes('<meta'), 'Meta标签缺失');
  test('SEO组件包含 Open Graph', seoContent.includes('og:'), 'Open Graph标签缺失');
  test('SEO组件包含 Twitter Card', seoContent.includes('twitter:'), 'Twitter Card缺失');
  test('SEO组件包含 JSON-LD', seoContent.includes('application/ld+json'), '结构化数据缺失');
  test('SEO组件包含 Organization Schema', seoContent.includes('organizationSchema'), 'Organization Schema缺失');
  test('SEO组件包含 WebSite Schema', seoContent.includes('websiteSchema'), 'WebSite Schema缺失');
  test('SEO组件包含 FAQ Schema', seoContent.includes('faqSchema'), 'FAQ Schema缺失');
  test('SEO组件包含 Product Schema', seoContent.includes('productSchema'), 'Product Schema缺失');
  test('SEO组件包含 HowTo Schema', seoContent.includes('howToSchema'), 'HowTo Schema缺失');
  test('SEO组件包含 Breadcrumb Schema', seoContent.includes('breadcrumbSchema'), 'Breadcrumb Schema缺失');
  test('SEO组件包含 canonical', seoContent.includes('canonical'), 'canonical链接缺失');
  test('SEO组件包含 robots', seoContent.includes('robots'), 'robots标签缺失');
  test('SEO组件包含 语言标签', seoContent.includes('zh-CN'), '语言标签缺失');
}

// ==================== 6. Breadcrumb组件验证 ====================
console.log('\n🍞 6. Breadcrumb组件验证');
console.log('-'.repeat(60));

const breadcrumbPath = path.join(__dirname, '..', 'src', 'components', 'Breadcrumb.astro');
if (fs.existsSync(breadcrumbPath)) {
  const breadcrumbContent = fs.readFileSync(breadcrumbPath, 'utf-8');
  
  test('Breadcrumb包含 nav标签', breadcrumbContent.includes('<nav'), 'nav标签缺失');
  test('Breadcrumb包含 aria-label', breadcrumbContent.includes('aria-label'), 'aria-label缺失');
  test('Breadcrumb包含 itemscope', breadcrumbContent.includes('itemscope'), 'itemscope缺失');
  test('Breadcrumb包含 BreadcrumbList', breadcrumbContent.includes('BreadcrumbList'), 'BreadcrumbList类型缺失');
  test('Breadcrumb包含路径映射', breadcrumbContent.includes('pathNames'), '路径映射缺失');
}

// ==================== 7. Netlify配置验证 ====================
console.log('\n⚙️  7. Netlify配置验证');
console.log('-'.repeat(60));

const netlifyPath = path.join(__dirname, '..', 'netlify.toml');
if (fs.existsSync(netlifyPath)) {
  const netlifyContent = fs.readFileSync(netlifyPath, 'utf-8');
  
  test('Netlify包含 build配置', netlifyContent.includes('[build]'), 'build配置缺失');
  test('Netlify包含 headers配置', netlifyContent.includes('[[headers]]'), 'headers配置缺失');
  test('Netlify包含安全头部', 
    netlifyContent.includes('X-Frame-Options') && 
    netlifyContent.includes('X-Content-Type-Options'), 
    '安全头部缺失');
  test('Netlify包含CSP', netlifyContent.includes('Content-Security-Policy'), 'CSP缺失');
  test('Netlify包含缓存策略', netlifyContent.includes('Cache-Control'), '缓存策略缺失');
  test('Netlify包含X-Robots-Tag', netlifyContent.includes('X-Robots-Tag'), 'X-Robots-Tag缺失');
  test('Netlify包含DNS预取', netlifyContent.includes('X-DNS-Prefetch-Control'), 'DNS预取控制缺失');
}

// ==================== 8. 页面Meta信息验证 ====================
console.log('\n📄 8. 页面Meta信息验证');
console.log('-'.repeat(60));

const pages = [
  'src/pages/index.astro',
  'src/pages/workpiece.astro',
  'src/pages/parameters.astro',
  'src/pages/history.astro',
  'src/pages/reports.astro'
];

pages.forEach(page => {
  const pagePath = path.join(__dirname, '..', page);
  if (fs.existsSync(pagePath)) {
    const pageContent = fs.readFileSync(pagePath, 'utf-8');
    const pageName = path.basename(page, '.astro');
    
    test(`${pageName} 包含 title变量`, pageContent.includes('const title'), `${pageName}: title变量缺失`);
    test(`${pageName} 包含 description变量`, pageContent.includes('const description'), `${pageName}: description变量缺失`);
    test(`${pageName} 包含 keywords变量`, pageContent.includes('const keywords'), `${pageName}: keywords变量缺失`);
    test(`${pageName} 使用 MainLayout`, pageContent.includes('MainLayout'), `${pageName}: MainLayout未使用`);
  }
});

// ==================== 9. 图标文件验证 ====================
console.log('\n🎨 9. 图标文件验证');
console.log('-'.repeat(60));

const iconSizes = [
  { file: 'favicon-16x16.png', size: 16 },
  { file: 'favicon-32x32.png', size: 32 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'android-chrome-192x192.png', size: 192 },
  { file: 'android-chrome-512x512.png', size: 512 }
];

iconSizes.forEach(icon => {
  const iconPath = path.join(__dirname, '..', 'public', icon.file);
  test(`${icon.file} (${icon.size}x${icon.size}) 存在`, 
    fs.existsSync(iconPath), 
    `图标文件不存在: ${icon.file}`);
});

// ==================== 10. 构建产物验证 ====================
console.log('\n🏗️  10. 构建产物验证（如果存在）');
console.log('-'.repeat(60));

const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  const distIndexPath = path.join(distPath, 'index.html');
  test('dist/index.html 存在', fs.existsSync(distIndexPath), 'index.html构建产物缺失');
  
  if (fs.existsSync(distIndexPath)) {
    const distIndexContent = fs.readFileSync(distIndexPath, 'utf-8');
    test('构建产物包含SEO meta', distIndexContent.includes('<meta'), 'SEO meta未包含在构建产物中');
    test('构建产物包含JSON-LD', distIndexContent.includes('application/ld+json'), 'JSON-LD未包含在构建产物中');
  }
} else {
  console.log('⚠️  dist目录不存在，跳过构建产物验证（需要先运行 pnpm build）');
}

// ==================== 测试结果汇总 ====================
console.log('\n' + '='.repeat(60));
console.log('\n📊 测试结果汇总');
console.log('-'.repeat(60));
console.log(`总测试数: ${results.total}`);
console.log(`✅ 通过: ${results.passed}`);
console.log(`❌ 失败: ${results.failed}`);
console.log(`通过率: ${((results.passed / results.total) * 100).toFixed(2)}%`);

if (results.failed === 0) {
  console.log('\n🎉 恭喜！所有SEO验证测试通过！');
  console.log('✨ 项目已达到最高SEO标准！');
} else {
  console.log('\n⚠️  有部分测试失败，请检查上述失败项');
}

console.log('\n' + '='.repeat(60));

// 生成测试报告文件
const reportPath = path.join(__dirname, '..', 'SEO_VALIDATION_REPORT.md');
let report = `# SEO验证测试报告\n\n`;
report += `**测试时间**: ${new Date().toLocaleString('zh-CN')}\n\n`;
report += `## 测试结果汇总\n\n`;
report += `- 总测试数: ${results.total}\n`;
report += `- ✅ 通过: ${results.passed}\n`;
report += `- ❌ 失败: ${results.failed}\n`;
report += `- 通过率: ${((results.passed / results.total) * 100).toFixed(2)}%\n\n`;
report += `## 详细结果\n\n`;
results.details.forEach(detail => {
  report += `### ${detail.status} ${detail.name}\n`;
  if (detail.message) {
    report += `${detail.message}\n`;
  }
  report += `\n`;
});

fs.writeFileSync(reportPath, report);
console.log(`\n📄 详细报告已生成: SEO_VALIDATION_REPORT.md\n`);

// 返回退出码
process.exit(results.failed > 0 ? 1 : 0);

