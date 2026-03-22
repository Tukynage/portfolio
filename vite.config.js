import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "tailwindcss";
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

function copyDatalogyStaticFiles() {
  return {
    name: 'copy-datalogy-static-files',
    closeBundle() {
      const rootDir = resolve(__dirname)
      const sourceDatalogyDir = resolve(rootDir, 'src/assets/media/web/datalogy')
      const sourceRedirectFile = resolve(rootDir, 'src/assets/media/web/datalogy_redirect.html')
      const distAssetsDir = resolve(rootDir, 'dist/assets')
      const targetDatalogyDir = resolve(distAssetsDir, 'datalogy')
      const targetRedirectFile = resolve(distAssetsDir, 'datalogy_redirect.html')

      if (!existsSync(distAssetsDir)) {
        mkdirSync(distAssetsDir, { recursive: true })
      }

      if (existsSync(sourceDatalogyDir)) {
        cpSync(sourceDatalogyDir, targetDatalogyDir, { recursive: true })
      }

      if (existsSync(sourceRedirectFile)) {
        cpSync(sourceRedirectFile, targetRedirectFile)
      }
    }
  }
}


// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), copyDatalogyStaticFiles()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
})
