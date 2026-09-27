/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module '*?url' {
  const url: string;
  export default url;
}

declare module '*?worker&url' {
  const url: string;
  export default url;
}

declare module 'maplibre-gl/dist/maplibre-gl.mjs' {
  export * from 'maplibre-gl';
}
