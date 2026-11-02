import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // To serve the app from a sub-path (for example example.com/app/), set base: '/app/'.
  // The router reads the same value through import.meta.env.BASE_URL.
  base: '/',
  server: { port: 5174 },
  preview: { port: 4174 },
})
