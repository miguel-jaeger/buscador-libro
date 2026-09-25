import { useState } from 'react'
import { SEARCH_FIELDS } from '../services/openLibrary.js'

const SOURCES = [
  { value: 'open-library', label: 'Open Library' },
  { value: 'gutenberg', label: 'Project Gutenberg' },
]

function SearchForm({ onSearch, loading }) {
  const [source, setSource] = useState('open-library')
  const [field, setField] = useState('isbn')
  const [query, setQuery] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (query.trim()) {
      onSearch(source, query, field)
    }
  }

  const isOpenLibrary = source === 'open-library'

  const placeholder =
    !isOpenLibrary
      ? 'Título, autor o tema'
      : field === 'isbn'
        ? 'Ej: 9780451524935'
        : field === 'oclc' || field === 'lccn'
          ? 'Identificador del registro'
          : 'Texto a buscar'

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-field">
        <label htmlFor="search-source">Fuente</label>
        <select
          id="search-source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          {SOURCES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {isOpenLibrary && (
        <div className="search-field">
          <label htmlFor="search-field">Campo</label>
          <select
            id="search-field"
            value={field}
            onChange={(e) => setField(e.target.value)}
          >
            {SEARCH_FIELDS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="search-query">
        <label htmlFor="search-query">Valor</label>
        <input
          id="search-query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Buscando…' : 'Buscar'}
      </button>
    </form>
  )
}

export default SearchForm