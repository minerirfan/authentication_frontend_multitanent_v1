/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_VERSION?: string;
  // Add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
