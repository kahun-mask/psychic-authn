import nodeResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import cjs from 'rollup-plugin-commonjs';

module.exports = {
  input: './src/client.ts',
  external: ['react'],
  output: {
    format: 'cjs',
    file: 'static/web-authn-utils.js'
  },
  plugins: [
    nodeResolve(),
    typescript({
      clean: true,
      rollupCommonJSResolveHack: true,
      tsconfigOverride: {
        compilerOptions: {
          module: 'esnext'
        }
      },
    }),
    cjs()
  ],
};

