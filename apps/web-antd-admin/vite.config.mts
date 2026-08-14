import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  const apiProxy = {
    // evie 产品服务（独立服务，端口 8100）
    '/api/evie': {
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api\/evie/, '/evie'),
      target: 'http://127.0.0.1:8100',
      ws: true,
    },
    '/api': {
      changeOrigin: true,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
      target: 'http://127.0.0.1:8000/admin/v1',
      ws: true,
    },
  };

  return {
    application: {},
    vite: {
      preview: {
        proxy: apiProxy,
      },
      server: {
        proxy: apiProxy,
      },
    },
  };
});
