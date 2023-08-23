const fs = require('fs')
const path = require('path')
const postcss = require('postcss')

const fontSizeToLineHeightMapping = new Map([
  ['0.6875rem', { lineHeight: '0.9rem' }], // 11px
  ['0.75rem', { lineHeight: '1rem' }], // 12px
  ['0.8125rem', { lineHeight: '1.1rem' }], // 13px
  ['0.875rem', { lineHeight: '1.25rem' }], // 14px
  ['0.9375rem', { lineHeight: '1.35rem' }], // 15px
  ['1rem', { lineHeight: '1.5rem' }], // 16px
  ['1.125rem', { lineHeight: '1.75rem' }], // 18px
  ['1.25rem', { lineHeight: '1.75rem' }], // 20px
  ['1.5rem', { lineHeight: '2rem' }], // 24px
  ['1.75rem', { lineHeight: '2.15rem' }], // 28px
  ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  ['2.25rem', { lineHeight: '2.5rem' }], // 36px
])

const getThemeTokens = () => {
  const values = [
    '--color',
    '--font-family',
    '--border-width',
    '--border-radius',
    '--box-shadow',
    '--font-size',
  ]

  const css = postcss.parse(
    fs.readFileSync(
      path.join(__dirname, '../../src/tokens.generated.module.css'),
      'utf8'
    )
  )
  const rootCss =
    css.nodes?.find(
      ({ type, selector }) => type === 'rule' && selector === ':global(:root)'
    )?.nodes || []

  const setValue = (propKey, propValue, value) => {
    if (value === '--font-size') {
      const lineHeightValue = fontSizeToLineHeightMapping.get(propValue)
      if (lineHeightValue) {
        return [`var(${propKey})`, lineHeightValue]
      }

      const parsedNumber = Number(propValue.replace('rem', ''))
      if (parsedNumber > 2.25) {
        return [`var(${propKey})`, { lineHeight: '1' }]
      }
    }

    return `var(${propKey})`
  }

  const data = values.map((value) => {
    return rootCss.reduce((acc, css) => {
      const { type, prop, value: propValue } = css
      if (type === 'decl' && prop.includes(value)) {
        let key = prop.replace(value, '').replace('-', '')
        if (!key) {
          key = 'DEFAULT'
        }

        acc[key] = setValue(prop, propValue, value)
      }
      return acc
    }, {})
  })

  const [colors, fontFamily, borderWidth, borderRadius, boxShadow, fontSize] =
    data

  return {
    colors,
    backgroundColor: colors,
    fontFamily,
    borderWidth,
    borderRadius,
    boxShadow,
    fontSize,
  }
}

module.exports = getThemeTokens
