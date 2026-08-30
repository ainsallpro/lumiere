import esbuild from 'esbuild';

try {
  await esbuild.build({
    entryPoints: ['server/src/app.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    outfile: 'api/index.js',
    external: ['@prisma/client'],
    banner: {
      js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
    }
  });
  console.log('API bundled successfully into api/index.js');
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
