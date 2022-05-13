import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/api.js'),
      name: 'mation-spec',
      fileName: (format) => `index.${format}.js`
    },
  },
  test: {
  },
})