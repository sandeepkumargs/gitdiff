/// <reference types="@rsbuild/core/types" />

declare namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_BASE_URL: string;
      REACT_APP_ORG_API_BASE_URL: string;
      // Add more environment variables as needed
    }
  }
   