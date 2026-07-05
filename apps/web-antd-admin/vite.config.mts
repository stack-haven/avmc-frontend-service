import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  const apiProxy = {
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
