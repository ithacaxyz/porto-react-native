import 'tsx/cjs'
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
  experimental: {
    matchVariant: true,
    optimizeUniversalDefaults: true,
  },
} satisfies Config
