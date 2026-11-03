/// <reference types="vite/client" />
declare const __DEMO_MODE__: boolean;
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}
