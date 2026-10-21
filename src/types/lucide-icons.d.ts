// lucide-react ships each icon's raw shape list alongside its component, but doesn't type the per-icon files.
declare module 'lucide-react/dist/esm/icons/*.js' {
  export const __iconNode: [string, Record<string, string>][];
}
