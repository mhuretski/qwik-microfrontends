import { CookieOptions } from '@builder.io/qwik-city/middleware/request-handler'

export function getCookie(name: string) {
  const cookieArray = document.cookie.split('; ')

  for (const cookie of cookieArray) {
    const [cookieName, cookieValue] = cookie.split('=')
    if (cookieName === name) {
      return decodeURIComponent(cookieValue)
    }
  }

  return null
}

export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
) {
  let expires = ''
  if (options.expires) {
    const date =
      typeof options.expires === 'string'
        ? options.expires
        : (options.expires as Date).toUTCString()
    expires = '; expires=' + date
  }
  const path = options.path ? '; path=' + options.path : ''
  const domain = options.domain ? '; domain=' + options.domain : ''
  const secure = options.secure ? '; secure' : ''

  document.cookie =
    name + '=' + encodeURIComponent(value) + expires + path + domain + secure
}

export function objectToCookiesString(
  object: Record<string, string | number | boolean>
) {
  return Object.entries(object)
    .map(
      ([key, value]) =>
        encodeURIComponent(key) + '=' + encodeURIComponent(value)
    )
    .join('; ')
}
