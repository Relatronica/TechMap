import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Aggiorna con PUBLIC_SITE_URL su Netlify se serve un override
const site = process.env.PUBLIC_SITE_URL || 'https://substrato.eu';

export default defineConfig({
  site,
  output: 'static',
  build: {
    assets: 'assets'
  },
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: {
      prefixDefaultLocale: false
    }
  },
  integrations: [sitemap()],
  devToolbar: {
    enabled: false
  },
  vite: {
    // MapLibre 6 is ESM-only; Vite's prebundle (.vite/deps/*.js) breaks Firefox MIME.
    // Load the package ESM + worker URL directly instead.
    worker: {
      format: 'es'
    },
    optimizeDeps: {
      exclude: ['maplibre-gl']
    },
    server: {
      // Ensure .mjs workers/modules get a JS MIME type in Firefox
      headers: {
        'Accept-Ranges': 'bytes'
      }
    }
  }
});
