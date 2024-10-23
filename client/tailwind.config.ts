import { Config } from 'tailwindcss';

const config: Config = {
  content: [
    '{routes,islands,components}/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
