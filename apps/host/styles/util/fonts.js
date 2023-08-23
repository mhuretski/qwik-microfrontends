const fs = require('fs')
const path = require('path')

const getFonts = (isDevelopment) => {
  const tokensPath = isDevelopment
    ? path.resolve(__dirname, '../../public/tokens.generated.json')
    : path.resolve(__dirname, '../../dist/public/tokens.generated.json') // TODO build

  const defaultTokens = {
    '--font-family': "'PT Sans'",
    '--font-family-heading': "'PT Sans'",
  }

  const { '--font-family': primaryFont, '--font-family-heading': headingFont } =
    fs.existsSync(tokensPath) ? require(tokensPath) : defaultTokens

  const fonts = [primaryFont]
  if (primaryFont !== headingFont) {
    fonts.push(headingFont)
  }

  return fonts.reduce((acc, font) => {
    const location = font.replaceAll("'", '').replaceAll(' ', '-').toLowerCase()

    const fonts = fs
      .readFileSync(
        path.join(__dirname, `../../public/fonts/${location}/fonts.css`)
      )
      .toString()

    const minifiedFonts = fonts
      .replace(/([^0-9a-zA-Z.#])\s+/g, '$1')
      .replace(/\s([^0-9a-zA-Z.#]+)/g, '$1')
      .replace(/\/\*.*?\*\//g, '')
      .replace(/;}/g, '}')

    acc += minifiedFonts

    return acc
  }, '')
}

module.exports = { getFonts }
