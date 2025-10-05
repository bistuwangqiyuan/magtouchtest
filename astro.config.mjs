import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // 站点配置
  site: 'https://your-domain.com', // 替换为你的实际域名
  
  // 输出模式：hybrid允许部分页面使用SSR
  output: 'static',
  
  // Netlify适配器配置
  adapter: netlify({
    edgeMiddleware: false,
  }),
  
  // 集成配置
  integrations: [
    react(), // React组件支持
  ],
  
  // Vite配置
  vite: {
    plugins: [tailwindcss()],
    // 优化依赖
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@supabase/supabase-js',
        'zustand',
        'chart.js',
      ],
    },
    // 构建配置
    build: {
      // 代码分割策略
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'supabase': ['@supabase/supabase-js'],
            'chart': ['chart.js'],
          },
        },
      },
    },
    // 服务器配置
    server: {
      // 开发服务器端口
      port: 4321,
      // 自动打开浏览器
      open: false,
    },
  },
  
  // 图片优化
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  
  // Markdown配置
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  
  // 实验性特性
  experimental: {
    // 按需启用实验性功能
  },
});
