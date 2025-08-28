import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import * as dotenv from 'dotenv';
import { table } from 'console';

dotenv.config()

export default defineConfig({
  source: {
    define: {
      'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL),
      'process.env.BASE_URL_FOR_LOGO': JSON.stringify(process.env.BASE_URL_FOR_LOGO),
      'process.env.ONBOARDING_URL': JSON.stringify(process.env.ONBOARDING_URL),
      'process.env.LOGIN_URL': JSON.stringify(process.env.LOGIN_URL),
      'process.env.ETL_API_BASE_URL': JSON.stringify(process.env.ETL_API_BASE_URL),
      'process.env.ORG_API_BASE_URL': JSON.stringify(process.env.ORG_API_BASE_URL),
    },
  },
  plugins: [pluginReact()],
  server: {
    port: 2000,
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production build, you need to configure output.assetPrefix
    assetPrefix: "http://localhost:2000",
  },
  output: {
    assetPrefix: "http://49.249.95.65:2000",
  },
  tools: {
    rspack: {
      
      plugins: [
        new ModuleFederationPlugin({
          name: 'federation_consumer',
          remotes: {
            ambiguity:
              'ambiguity@http://localhost:3000/mf-manifest.json',
            mindmaps:
              'mindmaps@http://localhost:3002/mf-manifest.json',
              testscenarios:
              'testscenarios@http://localhost:3003/mf-manifest.json',
              table:
              'table@http://localhost:3004/mf-manifest.json'
          },
            
          shared: ['react', 'react-dom'],
        })
      ],
    },
  },
  html: {
    title: 'Product',
  },
});