import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export default defineConfig({
  source: {
    define: {
      'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL),
      'process.env.BASE_URL_FOR_LOGO': JSON.stringify(process.env.BASE_URL_FOR_LOGO),
      'process.env.ONBOARDING_URL': JSON.stringify(process.env.ONBOARDING_URL),
      'process.env.LOGIN_URL': JSON.stringify(process.env.LOGIN_URL),
      'process.env.ETL_API_BASE_URL': JSON.stringify(process.env.ETL_API_BASE_URL),
      'process.env.ORG_API_BASE_URL': JSON.stringify(process.env.ORG_API_BASE_URL),
      'process.env.AC_URL': JSON.stringify(process.env.AC_URL),
      'process.env.TS_URL': JSON.stringify(process.env.TS_URL),
    },
  },
  plugins: [pluginReact()],
  server: {
    port: 3000,
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production build, you need to configure output.assetPrefix
    assetPrefix: "http://localhost:3000",
  },
  output: {
    assetPrefix: "http://49.249.95.65:3000",
  },
  tools: {
    rspack: {
      output: {
        uniqueName: 'federation_provider'
      },
      plugins: [
        new ModuleFederationPlugin({
          name: 'federation_provider',
          exposes: {
            './Ambiguity': './src/ambiguity.tsx',
            './AmbiguityChecker':'./src/pages/ambiguity-checker/index.tsx',
          },
          shared: {
            react: { singleton: true, eager: true },
            'react-dom': { singleton: true, eager: true },
            'primereact': { singleton: true, eager: true },
          },
        }),
      ],
    },
  },
  html: {
    title: 'Product',
  },
});