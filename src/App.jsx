import { useState } from 'react'
import './App.css'
import { searchBooks } from './services/openLibrary.js'
import { searchGutenberg } from './services/gutenberg.js'
import SearchForm from './components/SearchForm.jsx'
import ResultsTable from './components/ResultsTable.jsx'
import BookDetail from './components/BookDetail.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { useTheme } from './hooks/useTheme.js'
import downloadJson from './utils/exportJson.js'
import { toDublinCoreList } from './utils/dublinCore.js'

function App() {
  const { theme, toggleTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)

  async function handleSearch(source, query, field) {
    setLoading(true)
    setError(null)
    try {
      const data =
        source === 'gutenberg'
          ? await searchGutenberg(query)
          : await searchBooks(field, query)
      setResult(data)
    } catch (err) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  function handleExport() {
    if (!result) return
    downloadJson(result, 'busqueda-libros')
  }

  function handleExportDublinCore() {
    if (!result) return
    const records = toDublinCoreList(result.items)
    downloadJson(
      {
        schemas: ['http://purl.org/dc/elements/1.1/'],
        records,
      },
      'busqueda-libros-dublin-core',
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-row">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <h1>Buscador de libros</h1>
        <p>
          Búsqueda de metadatos de libros usando las API públicas de{' '}
          <a href="https://openlibrary.org/developers/api" target="_blank" rel="noreferrer">
            Open Library
          </a>{' '}
          y{' '}
          <a href="https://www.gutenberg.org/" target="_blank" rel="noreferrer">
            Project Gutenberg
          </a>
          , con descarga directa de los libros digitales.
        </p>
      </header>

      <main>
        <SearchForm onSearch={handleSearch} loading={loading} />

        {error && <p className="error">Error: {error}</p>}

        <div className="actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExport}
            disabled={!result}
          >
            Guardar resultados en JSON
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportDublinCore}
            disabled={!result}
          >
            Guardar resultados en Dublin Core (JSON)
          </button>
        </div>

        <ResultsTable result={result} onView={setSelectedBook} />
      </main>

      <footer className="app-footer">
        Datos públicos de Open Library, licencia{' '}
        <a href="https://openlibrary.org/developers/api" target="_blank" rel="noreferrer">
          CC0
        </a>
        .
      </footer>

      {selectedBook && <BookDetail book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </div>
  )
}

export default App