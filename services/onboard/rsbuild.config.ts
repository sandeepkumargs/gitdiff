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
    },
  },
  plugins: [pluginReact()],
  server: {
    port: 3001,
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production build, you need to configure output.assetPrefix
    assetPrefix: "http://localhost:3001",
  },
  output: {
    assetPrefix: "http://49.249.95.65:3001",
  },
  tools: {
    rspack: {
      output: {
        // You need to set a unique value that is not equal to other applications
        uniqueName: 'onboarding'
      },
    },
  },
  html: {
    title: 'PlatForm',
  },
});
