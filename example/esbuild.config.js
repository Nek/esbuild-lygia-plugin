import * as esbuild from 'esbuild';
import lygiaPlugin from '../../src/plugin.mjs';

await esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  plugins: [lygiaPlugin()],
  loader: {
    '.glsl': 'text',
  },
});
