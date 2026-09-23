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
  integrations: [sitemap()],
  devToolbar: {
    enabled: false
  }
});
