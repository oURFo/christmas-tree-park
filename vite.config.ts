import { defineConfig } from 'vite'

// GitHub Pages：若 repo 名不是根網域，請把 base 改成 '/你的repo名/'
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    sourcemap: true,
  },
})
