import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Testes de navegador ficam separados: `npm run test:e2e` (precisam do build).
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
  },
});
