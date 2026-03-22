/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          // Optimize animations and keyframes
          reduceIdents: true,
          // Minimize calc expressions
          calc: true,
          // Remove unused keyframes
          discardUnused: true,
        }],
      },
    }),
  },
};

export default config;
