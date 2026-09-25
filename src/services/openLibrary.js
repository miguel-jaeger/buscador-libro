const BASE_URL = 'https://openlibrary.org/search.json'
const USER_AGENT = 'buscador-libro/1.0 (contact: miguel.jaeger@gmail.com)'

export const SEARCH_FIELDS = [
  { value: 'isbn', label: 'ISBN' },
  { value: 'q', label: 'Título / Palabra clave' },
  { value: 'title', label: 'Título exacto' },
  { value: 'author', label: 'Autor' },
  { value: 'publisher', label: 'Editorial' },
  { value: 'subject', label: 'Materia' },
  { value: 'oclc', label: 'OCLC' },
  { value: 'lccn', label: 'LCCN' },
]

const REQUESTED_FIELDS = [
  'key',
  'title',
  'author_name',
  'first_publish_year',
  'publish_year',
  'publisher',
  'isbn',
  'oclc',
  'lccn',
  'cover_i',
  'number_of_pages_median',
  'language',
  'subject',
  'ebook_access',
  'edition_count',
].join(',')

function buildParams(field, query) {
  const params = new URLSearchParams()
  params.set('fields', REQUESTED_FIELDS)
  params.set('limit', '20')
  params.set(field, query)
  return params
}

function normalize(doc) {
  return {
    id: doc.key,
    source: 'open-library',
    title: doc.title,
    authors: doc.author_name ?? [],
    firstPublishYear: doc.first_publish_year ?? null,
    publishYears: doc.publish_year ?? [],
    publishers: doc.publisher ?? [],
    isbns: doc.isbn ?? [],
    oclcs: doc.oclc ?? [],
    lccns: doc.lccn ?? [],
    coverId: doc.cover_i ?? null,
    pageCount: doc.number_of_pages_median ?? null,
    languages: doc.language ?? [],
    subjects: doc.subject ?? [],
    ebookAccess: doc.ebook_access ?? null,
    editionCount: doc.edition_count ?? 0,
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : null,
    downloadLinks: doc.ebook_access && doc.ebook_access !== 'none' ? [] : [],
    url: doc.key ? `https://openlibrary.org${doc.key}` : null,
  }
}

export async function searchBooks(field, query) {
  const params = buildParams(field, query.trim())
  const response = await fetch(`${BASE_URL}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}: no se pudo consultar Open Library`)
  }

  const data = await response.json()

  return {
    numFound: data.numFound ?? 0,
    startedAt: data.start ?? 0,
    q: data.q ?? query,
    items: (data.docs ?? []).map(normalize),
    raw: data,
  }
}