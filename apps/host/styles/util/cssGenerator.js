const Css = require('json-to-css')
const fs = require('fs')
const path = require('path')

const uncoveredCssProperties = require('../uncoveredCssProperties')
const { getFonts } = require('./fonts')

const writeCssTokens = (tokens, isDevelopmentMode) => {
  /*
   * These are for theme editor
   */
  if (!isDevelopmentMode) {
    const dir = path.resolve(__dirname, '../../dist/static/')

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
  fs.writeFileSync(
    isDevelopmentMode
      ? path.resolve(__dirname, '../../public/tokens.generated.json')
      : // TODO build
        path.resolve(__dirname, '../../dist/public/tokens.generated.json'),
    JSON.stringify(tokens),
    'utf-8',
    function (err) {
      console.log(err)
    }
  )
}

const generateListOfAvailableFonts = (isDevelopmentMode) => {
  const availableFonts = fs.readdirSync(
    path.resolve(__dirname, '../../public/fonts')
  )

  fs.writeFileSync(
    path.resolve(
      __dirname,
      isDevelopmentMode
        ? '../../public/fonts.generated.json'
        : '../../dist/public/fonts.generated.json' // TODO build
    ),
    JSON.stringify(availableFonts)
  )
}

const getTokensData = () => {
  const defaultTokens = require('../tokens.default.json')

  const userTokens = fs.existsSync(path.resolve(__dirname, '../tokens.json'))
    ? require('../tokens.json')
    : { light: {}, dark: {} }

  const tokens = {
    ...defaultTokens,
    ...userTokens,
    light: {
      ...defaultTokens.light,
      ...userTokens?.light,
    },
    dark: {
      ...defaultTokens.dark,
      ...userTokens?.dark,
    },
  }

  delete tokens['theme-media']
  delete tokens.manifest

  /*
   * Added to keep compatibility with older versions
   */
  // TODO remove once all envs will migrate to new tokens scheme
  delete tokens['--font-family-secondary']

  return tokens
}

const getCssTokens = (isBuildTime, isDevelopmentMode) => {
  const json = getTokensData(isDevelopmentMode)
  writeCssTokens(json, isDevelopmentMode)

  const itemRadius = parseInt(json['--border-radius-item'])
  const checkboxRadius =
    itemRadius > 6 || isNaN(itemRadius) ? '6px' : itemRadius

  const fontFamily = `${json['--font-family'].replaceAll("'", '"')}, sans-serif`
  const fontFamilyHeading = `${json['--font-family-heading'].replaceAll(
    "'",
    '"'
  )}, sans-serif`

  const tokens = {
    [isBuildTime ? ':global(:root)' : ':root']: {
      ...Object.entries(json.light)
        .filter(([key]) => key.startsWith('--color'))
        .reduce((acc, [key, value]) => {
          acc[key.replace('--color', '--color-unchanged')] = value
          return acc
        }, {}),
      ...json.light,
      ...Object.entries(json)
        .filter(([key]) => key.startsWith('--'))
        .reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {}),
      ...uncoveredCssProperties,
      '--border-radius-checkbox': checkboxRadius,
      '--font-family': fontFamily,
      '--font-family-heading': fontFamilyHeading,
    },
    [isBuildTime ? ":global([data-theme='dark'])" : '[data-theme=dark]']: {
      ...json.dark,
    },
  }

  return Css.of(tokens)
}

const generateCssTokens = (isDevelopmentMode) => {
  const css = getCssTokens(true, isDevelopmentMode)

  generateListOfAvailableFonts(isDevelopmentMode)
  fs.writeFileSync(
    path.resolve(__dirname, '../../src/tokens.generated.module.css'),
    css
  )
  const fonts = getFonts(isDevelopmentMode)
  fs.writeFileSync(
    path.resolve(__dirname, '../../src/fonts.generated.module.css'),
    fonts
  )
}

const updateCssTokensRuntime = async () => {
  const css = `'${getCssTokens(false, false).replaceAll('\n', '')}'`

  const regex = /':root.*}'/g

  let foundStyles = false

  fs.readdirSync(path.resolve(__dirname, '../../dist')).forEach((file) => {
    if (foundStyles) return

    const entityPath = path.resolve(__dirname, '../../dist', file)

    if (fs.lstatSync(entityPath).isFile()) {
      fs.readFile(entityPath, 'utf-8', function (err, contents) {
        if (err) {
          console.log(err)
          return
        }

        if (regex.test(contents)) {
          const replaced = contents.replace(regex, css)

          fs.writeFileSync(entityPath, replaced, 'utf-8', function (err) {
            console.log(err)
          })

          foundStyles = true
        }
      })
    }
  })
}

module.exports = {
  generateCssTokens,
  updateCssTokensRuntime,
}
