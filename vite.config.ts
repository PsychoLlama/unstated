import { defineConfig } from 'vite';
import { readFile } from 'fs/promises';

export default defineConfig(async () => {
  const pkg = await readFile('package.json', 'utf8');
  const { dependencies, peerDependencies } = JSON.parse(pkg);

  return {
    build: {
      lib: {
        entry: './src/index.ts',
        name: 'unstated',
        fileName: 'unstated',
      },
      rollupOptions: {
        external: [dependencies, peerDependencies].map(Object.keys).flat(),

        // Only used for UMD builds.
        output: {
          globals: {
            react: 'React',
            immer: 'immer',
          },
        },
      },
    },
  };
});
