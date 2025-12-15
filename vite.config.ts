import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Prioritize process.env (Vercel) over .env file, fallback to empty string
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY || ''),
    }
  }
})