// Shared CSV fetching utility used by both the config sheet and tracker sheets

export function buildCsvUrl(sheetUrl) {
  // Already a CSV URL
  if (sheetUrl.includes('output=csv')) return sheetUrl

  // Published-to-web HTML URL → swap pubhtml for pub?output=csv
  // e.g. https://docs.google.com/spreadsheets/d/e/LONG_KEY/pubhtml
  if (sheetUrl.includes('/pub') && sheetUrl.includes('/d/e/')) {
    return sheetUrl.replace(/\/pubhtml.*$/, '/pub?output=csv')
                   .replace(/\/pub(\?.*)?$/, '/pub?output=csv')
  }

  // pub? URL without output=csv — add it
  if (sheetUrl.includes('pub?')) {
    return sheetUrl.includes('?') ? sheetUrl + '&output=csv' : sheetUrl + '?output=csv'
  }

  // Regular sheet URL — extract the sheet ID and use gviz CSV endpoint
  const m = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  if (!m) throw new Error('Cannot extract sheet ID from URL: ' + sheetUrl)
  return `https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq?tqx=out:csv`
}

export async function fetchCsv(url) {
  async function checkHtml(text) {
    if (text.trimStart().startsWith('<'))
      throw new Error('Sheet is not accessible. Make sure it is published or shared as "Anyone with link can view".')
    return text
  }

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return checkHtml(await res.text())
  } catch (err) {
    if (err.message.includes('not accessible')) throw err
    // CORS fallback via proxy
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const res   = await fetch(proxy)
    if (!res.ok) throw new Error('Could not reach the sheet. Check the URL and sharing settings.')
    const json  = await res.json()
    return checkHtml(json.contents)
  }
}
