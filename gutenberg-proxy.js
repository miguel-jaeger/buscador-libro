const SEARCH_URL = (query) =>
  `https://www.gutenberg.org/ebooks/search.opds/?query=${encodeURIComponent(query)}`
const DETAIL_URL = (id) => `https://www.gutenberg.org/ebooks/${id}.opds`
const USER_AGENT = 'buscador-libro/1.0 (contact: miguel.jaeger@gmail.com)'
const MAX_RESULTS = 12

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i'))
  return m ? m[1] : null
}

function element(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return m ? m[1].trim() : ''
}

function parseLinks(xml) {
  const links = []
  const re = /<link\b[^>]*\/\s*>/gi
  let m
  while ((m = re.exec(xml))) {
    const tag = m[0]
    const href = attr(tag, 'href')
    if (!href) continue
    links.push({
      rel: attr(tag, 'rel'),
      type: attr(tag, 'type'),
      title: attr(tag, 'title'),
      length: attr(tag, 'length'),
      href,
    })
  }
  return links
}

function parseEntry(entryXml) {
  const idMatch = entryXml.match(/\/ebooks\/(\d+)\.opds/)
  const id = idMatch ? idMatch[1] : null
  const content = element(entryXml, 'content')
  const isDownloadCount = /^\d+ downloads$/.test(content.trim())

  return {
    id,
    title: element(entryXml, 'title'),
    author: isDownloadCount ? '' : content,
    coverThumb: parseLinks(entryXml).find((l) => l.rel === 'http://opds-spec.org/image/thumbnail')
      ?.href ?? null,
  }
}

async function fetchDetail(id) {
  const response = await fetch(DETAIL_URL(id), {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status} para el libro ${id}`)
  const xml = await response.text()
  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/)
  if (!entry) return { downloads: [], cover: null, subjects: [], bookshelves: [] }

  const entryXml = entry[1]
  const links = parseLinks(entryXml)
  const acquisitions = links.filter((l) => l.rel === 'http://opds-spec.org/acquisition')
  const subjects = links
    .filter((l) => l.rel === 'related' && l.href.includes('/ebooks/subject/'))
    .map((l) => l.title?.replace(/^On\s+/, '').replace(/\.$/, ''))
    .filter(Boolean)
  const bookshelves = links
    .filter((l) => l.rel === 'related' && l.href.includes('/ebooks/bookshelf/'))
    .map((l) => l.title?.replace(/^In\s+/, ''))
    .filter(Boolean)

  return {
    downloads: acquisitions.map((l) => ({
      title: l.title,
      type: l.type,
      href: l.href,
      length: l.length ? Number(l.length) : null,
    })),
    cover: links.find((l) => l.rel === 'http://opds-spec.org/image')?.href ?? null,
    subjects,
    bookshelves,
  }
}

function formatLabel(type) {
  if (type.includes('epub')) {
    return 'EPUB'
  }
  if (type.includes('mobipocket')) {
    return 'MOBI/Kindle'
  }
  if (type.startsWith('text/plain')) {
    return 'TXT'
  }
  if (type.includes('pdf')) {
    return 'PDF'
  }
  if (type.startsWith('text/html')) {
    return 'HTML'
  }
  return type.split(';')[0]
}

async function handleRequest(query) {
  const searchResponse = await fetch(SEARCH_URL(query), {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!searchResponse.ok) {
    throw new Error(`HTTP ${searchResponse.status} en el catálogo de Project Gutenberg`)
  }
  const searchXml = await searchResponse.text()

  const entries = (searchXml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [])
    .map((e) => parseEntry(e.slice(7, -8)))
    .filter((e) => e.id && e.title && e.title !== 'No records found.')
    .filter((e) => e.author)
    .slice(0, MAX_RESULTS)

  if (entries.length === 0) {
    return { source: 'gutenberg', numFound: 0, books: [] }
  }

  const details = await Promise.allSettled(entries.map((e) => fetchDetail(e.id)))

  const books = entries.map((entry, i) => {
    const detail = details[i].status === 'fulfilled' ? details[i].value : null
    return {
      id: entry.id,
      title: entry.title,
      author: entry.author,
      cover: detail?.cover ?? entry.coverThumb ?? null,
      coverThumb: entry.coverThumb,
      subjects: detail?.subjects ?? [],
      bookshelves: detail?.bookshelves ?? [],
      downloads: detail?.downloads ?? [],
    }
  })

  return { source: 'gutenberg', numFound: books.length, books }
}

export function gutenbergProxy() {
  return {
    name: 'gutenberg-opds-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/gutenberg', async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        const query = url.searchParams.get('search')

        if (!query) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Falta el parámetro search' }))
          return
        }

        try {
          const payload = await handleRequest(query)
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(JSON.stringify(payload))
        } catch (err) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

export { formatLabel }