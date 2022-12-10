import { defineConfig } from 'vite';
import { builtinModules } from 'module';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'unstated',
      fileName: 'unstated',
    },
    rollupOptions: {
      // TODO: Dynamically exclude all production dependencies.
      external: builtinModules,
    },
  },
});
