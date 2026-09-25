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

const IDENTIFIER_PREFIXES = {
  lccn: 'LCCN',
  oclc: 'OCLC',
}

function toW3CDate(year) {
  return year ? String(year) : null
}

function buildIdentifiers(book) {
  const identifiers = book.isbns.map((isbn) => `ISBN:${isbn}`)
  if (book.oclcs?.length) {
    identifiers.push(...book.oclcs.map((id) => `OCLC:${id}`))
  }
  if (book.lccns?.length) {
    identifiers.push(...book.lccns.map((id) => `LCCN:${id}`))
  }
  if (book.id) {
    identifiers.push(book.id)
  }
  return identifiers.length ? identifiers : null
}

export function toDublinCore(book) {
  return {
    'dc:title': book.title ?? null,
    'dc:creator': book.authors.length ? book.authors : null,
    'dc:subject': book.subjects.length ? book.subjects : null,
    'dc:description': book.description ?? null,
    'dc:publisher': book.publishers.length ? book.publishers : null,
    'dc:contributor': null,
    'dc:date': toW3CDate(book.firstPublishYear),
    'dc:type': 'Libro (Text)',
    'dc:format': book.pageCount ? `${book.pageCount} páginas` : null,
    'dc:identifier': buildIdentifiers(book),
    'dc:source': book.coverUrl ?? null,
    'dc:language': book.languages.length ? book.languages : null,
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

export { IDENTIFIER_PREFIXES }