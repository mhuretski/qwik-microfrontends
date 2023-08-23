const { join } = require('path')
const plugin = require('tailwindcss/plugin')

const getThemeTokens = require('./styles/util/parser')

const getThemePreset = () => {
  const themeTokens = getThemeTokens()

  return {
    plugins: [
      plugin(function ({ addComponents }) {
        addComponents({
          '.absolute-center': {
            '@apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2':
              {},
          },
          '.border-standard': {
            '@apply border border-border': {},
          },
          '.border-standard-theme': {
            '@apply border border-primary': {},
          },
          '.border-standard-b': {
            '@apply border-b border-border': {},
          },
          '.border-standard-t': {
            '@apply border-t border-border': {},
          },
          '.border-standard-l': {
            '@apply border-l border-border': {},
          },
          '.border-standard-r': {
            '@apply border-r border-border': {},
          },
          '.border-semibold-size': {
            '@apply border-semibold border-border': {},
          },
          '.normalize-fontsize': {
            'font-size': '100%;',
          },
          '.transition-standard': {
            transition: 'all 0.3s ease-in-out',
          },
          '.transition-fast': {
            transition: 'all 0.2s ease',
          },
        })
      }),
    ],
    theme: {
      extend: {
        ...themeTokens,
        scale: {
          101: '1.01',
        },
      },
    },
  }
}

/** @type {import('tailwindcss').Config} */
const config = {
  presets: [getThemePreset()],
  content: [
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx,mdx}'),
    join(__dirname, '../static/src/**/*.{js,ts,jsx,tsx,mdx}'),
    join(__dirname, '../../libs/ui/src/**/*.{js,ts,jsx,tsx,mdx}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

module.exports = config
