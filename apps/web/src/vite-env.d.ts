/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
