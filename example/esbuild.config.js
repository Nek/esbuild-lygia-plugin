import * as esbuild from 'esbuild';
import lygiaPlugin from '../src/plugin.mjs';

const ctx = await esbuild.context({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  plugins: [lygiaPlugin()],
  loader: {
    '.glsl': 'text',
  },
  sourcemap: true,
  logLevel: 'info',
  format: 'esm',
});

const args = process.argv.slice(2);
if (args.includes('--dev')) {
  // Dev mode with server
  await ctx.serve({
    servedir: '.',
    port: 8000,
  });
  await ctx.watch();
  console.log('Dev server running on http://localhost:8000');
} else {
  // Production build
  await ctx.rebuild();
  await ctx.dispose();
}
