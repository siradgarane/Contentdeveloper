import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// When building for GitHub Pages the app is served from
// https://<user>.github.io/Contentdeveloper/ , so assets need that base path.
// Locally (npm run dev / preview) it stays at the root.
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/Contentdeveloper/' : '/',
  plugins: [react()]
});
