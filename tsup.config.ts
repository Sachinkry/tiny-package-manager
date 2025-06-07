import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/bin/tinypm.ts'],
  format: ['esm'],
  dts: true,
  outDir: 'build',
  clean: true,
});