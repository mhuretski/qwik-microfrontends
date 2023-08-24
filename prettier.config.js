/** @type {import("prettier").Config} */
const config = {
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],
  tailwindConfig: './apps/host/tailwind.config.js',
  singleQuote: true,
  trailingComma: 'es5',
  semi: false,
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '^shared/',
    '~(.*)',
    '^(./|../)(?!.*inline$).*$',
    'inline$',
  ],
  importOrderSeparation: true,
}

module.exports = config
