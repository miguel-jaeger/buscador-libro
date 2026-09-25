export const DUBLIN_CORE_ELEMENTS = [
  { key: 'dc:title', label: 'dc:title', description: 'Título' },
  { key: 'dc:creator', label: 'dc:creator', description: 'Creador / Autor' },
  { key: 'dc:subject', label: 'dc:subject', description: 'Materia' },
  { key: 'dc:description', label: 'dc:description', description: 'Descripción' },
  { key: 'dc:publisher', label: 'dc:publisher', description: 'Editorial' },
  { key: 'dc:contributor', label: 'dc:contributor', description: 'Colaborador' },
  { key: 'dc:date', label: 'dc:date', description: 'Fecha de publicación' },
  { key: 'dc:type', label: 'dc:type', description: 'Tipo de recurso' },
  { key: 'dc:format', label: 'dc:format', description: 'Formato / Extensión' },
  { key: 'dc:identifier', label: 'dc:identifier', description: 'Identificador' },
  { key: 'dc:source', label: 'dc:source', description: 'Fuente' },
  { key: 'dc:language', label: 'dc:language', description: 'Idioma' },
  { key: 'dc:relation', label: 'dc:relation', description: 'Relación' },
  { key: 'dc:coverage', label: 'dc:coverage', description: 'Cobertura' },
  { key: 'dc:rights', label: 'dc:rights', description: 'Derechos' },
]

function toW3CDate(year) {
  return year ? String(year) : null
}

function unique(list) {
  return [...new Set(list.filter(Boolean))]
}

function buildIdentifiers(book) {
  const primaryIsbn =
    book.isbns.find((isbn) => isbn.length === 13) ??
    book.isbns.find((isbn) => isbn.length === 10)
  const identifiers = []
  if (primaryIsbn) identifiers.push(`ISBN:${primaryIsbn}`)
  if (book.oclcs?.[0]) identifiers.push(`OCLC:${book.oclcs[0]}`)
  if (book.lccns?.[0]) identifiers.push(`LCCN:${book.lccns[0]}`)
  if (book.id) identifiers.push(book.id)
  return identifiers.length ? identifiers : null
}

export function toDublinCore(book) {
  return {
    'dc:title': book.title ?? null,
    'dc:creator': unique(book.authors).slice(0, 10) || null,
    'dc:subject': unique(book.subjects).slice(0, 20) || null,
    'dc:description': book.description ?? null,
    'dc:publisher': unique(book.publishers).slice(0, 10) || null,
    'dc:contributor': null,
    'dc:date': toW3CDate(book.firstPublishYear),
    'dc:type': 'Libro (Text)',
    'dc:format': book.pageCount ? `${book.pageCount} páginas` : null,
    'dc:identifier': buildIdentifiers(book),
    'dc:source': book.coverUrl ?? null,
    'dc:language': unique(book.languages) || null,
    'dc:relation': book.url ?? null,
    'dc:coverage': null,
    'dc:rights': 'Acceso abierto / Dominio público (Open Library)',
  }
}

export function toDublinCoreList(books) {
  return books.map((book) => ({
    id: book.id,
    dc: toDublinCore(book),
  }))
}