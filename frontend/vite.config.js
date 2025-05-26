import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/challenger-crm/', // <-- обязательно для GitHub Pages!
  plugins: [react()],
});
