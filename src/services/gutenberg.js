const PROXY_URL = '/api/gutenberg?search='
const GUTENDEX_URL = 'https://gutendex.com/books/'
const USER_AGENT = 'buscador-libro/1.0 (contact: miguel.jaeger@gmail.com)'

function sizeLabel(bytes) {
  if (!bytes) return null
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${Math.round(bytes / 1024)} KB`
}

function normalizeProxyBook(book) {
  const downloads = (book.downloads ?? []).map((d) => {
    const mime = d.type ?? ''
    const format = mime.includes('epub')
      ? 'EPUB'
      : mime.includes('mobipocket')
        ? 'MOBI/Kindle'
        : mime.startsWith('text/plain')
          ? 'TXT'
          : mime.includes('pdf')
            ? 'PDF'
            : mime.startsWith('text/html')
              ? 'HTML'
              : 'Otro'

    return {
      format,
      mime,
      url: d.href,
      size: sizeLabel(d.length),
      title: d.title,
    }
  })

  return {
    id: `gutenberg:${book.id}`,
    source: 'gutenberg',
    title: book.title,
    authors: book.author ? [book.author] : [],
    firstPublishYear: null,
    publishYears: [],
    publishers: [],
    isbns: [],
    oclcs: [],
    lccns: [],
    languages: [],
    subjects: book.subjects ?? [],
    pageCount: null,
    coverId: null,
    coverUrl: book.cover ?? null,
    downloadLinks: downloads,
    url: book.id
      ? `https://www.gutenberg.org/ebooks/${book.id}`
      : null,
    downloadCount: null,
    bookshelves: book.bookshelves ?? [],
  }
}

async function fetchProxy(query) {
  const response = await fetch(`${PROXY_URL}${encodeURIComponent(query.trim())}`)
  const type = response.headers.get('content-type') ?? ''
  if (!type.includes('application/json')) return null
  if (!response.ok) return null
  return response.json()
}

function normalizeGutendexBook(book) {
  const formats = book.formats ?? {}
  const downloadLinks = []
  const FORMAT_ORDER = [
    { mime: 'text/plain', label: 'TXT' },
    { mime: 'application/epub+zip', label: 'EPUB' },
    { mime: 'application/x-mobipocket-ebook', label: 'MOBI/Kindle' },
    { mime: 'application/pdf', label: 'PDF' },
  ]
  for (const [mime, url] of Object.entries(formats)) {
    const match = FORMAT_ORDER.find((f) => mime.startsWith(f.mime))
    if (match) downloadLinks.push({ format: match.label, mime, url })
  }

  return {
    id: `gutenberg:${book.id}`,
    source: 'gutenberg',
    title: book.title,
    authors: (book.authors ?? []).map((a) => a.name),
    firstPublishYear: null,
    publishYears: [],
    publishers: [],
    isbns: [],
    oclcs: [],
    lccns: [],
    languages: book.languages ?? [],
    subjects: book.subjects ?? [],
    pageCount: null,
    coverId: null,
    coverUrl: formats['image/jpeg'] ?? null,
    downloadLinks,
    url: `https://www.gutenberg.org/ebooks/${book.id}`,
    downloadCount: book.download_count ?? 0,
    bookshelves: book.bookshelves ?? [],
  }
}

async function fetchGutendex(query) {
  const params = new URLSearchParams()
  params.set('search', query.trim())
  const response = await fetch(`${GUTENDEX_URL}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}: no se pudo consultar Project Gutenberg`)
  }
  const data = await response.json()
  return {
    numFound: data.count ?? 0,
    startedAt: 0,
    q: query,
    source: 'gutenberg',
    items: (data.results ?? []).map(normalizeGutendexBook),
    raw: data,
  }
}

export async function searchGutenberg(query) {
  const proxy = await fetchProxy(query)

  if (proxy && Array.isArray(proxy.books)) {
    return {
      numFound: proxy.numFound ?? proxy.books.length,
      startedAt: 0,
      q: query,
      source: 'gutenberg',
      items: proxy.books.map(normalizeProxyBook),
      raw: proxy,
    }
  }

  return fetchGutendex(query)
}