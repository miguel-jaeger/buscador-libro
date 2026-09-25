const BASE_URL = 'https://gutendex.com/books/'
const USER_AGENT = 'buscador-libro/1.0 (contact: miguel.jaeger@gmail.com)'

const FORMAT_ORDER = [
  { mime: 'text/plain', label: 'TXT' },
  { mime: 'application/epub+zip', label: 'EPUB' },
  { mime: 'application/x-mobipocket-ebook', label: 'MOBI/Kindle' },
  { mime: 'application/pdf', label: 'PDF' },
]

function buildUrl(query) {
  const params = new URLSearchParams()
  params.set('search', query.trim())
  return `${BASE_URL}?${params}`
}

function buildDownloadLinks(formats) {
  if (!formats || typeof formats !== 'object') return []

  const links = []
  for (const [mime, url] of Object.entries(formats)) {
    const match = FORMAT_ORDER.find((f) => mime.startsWith(f.mime))
    if (match) {
      links.push({ format: match.label, mime, url })
    }
  }

  links.sort(
    (a, b) =>
      FORMAT_ORDER.findIndex((f) => f.label === a.format) -
      FORMAT_ORDER.findIndex((f) => f.label === b.format),
  )
  return links
}

function normalize(book) {
  const formats = book.formats ?? {}
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
    downloadLinks: buildDownloadLinks(formats),
    url: `https://www.gutenberg.org/ebooks/${book.id}`,
    downloadCount: book.download_count ?? 0,
    bookshelves: book.bookshelves ?? [],
  }
}

export async function searchGutenberg(query) {
  const response = await fetch(buildUrl(query), {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!response.ok) {
    throw new Error(
      `Error HTTP ${response.status}: no se pudo consultar Project Gutenberg`,
    )
  }

  const data = await response.json()

  return {
    numFound: data.count ?? 0,
    startedAt: 0,
    q: query,
    source: 'gutenberg',
    items: (data.results ?? []).map(normalize),
    raw: data,
  }
}