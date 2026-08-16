// Minimal import.meta.env declaration so this lib works in a Vite context
// without requiring vite as a peer dependency of the lib itself.
interface ImportMetaEnv {
  readonly BASE_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
