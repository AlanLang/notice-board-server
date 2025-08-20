import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  output: {
    distPath: {
      root: "web"
    }
  },
  tools: {
    postcss: {
      plugins: [
        [require('@tailwindcss/postcss'), {
          content: ['./src/**/*.{js,jsx,ts,tsx}']
        }],
      ],
    },
  },
});
