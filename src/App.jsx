import { useState } from 'react'
import './App.css'
import { searchBooks } from './services/openLibrary.js'
import SearchForm from './components/SearchForm.jsx'
import ResultsTable from './components/ResultsTable.jsx'
import BookDetail from './components/BookDetail.jsx'
import downloadJson from './utils/exportJson.js'
import { toDublinCoreList } from './utils/dublinCore.js'

function App() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [selectedBook, setSelectedBook] = useState(null)

  async function handleSearch(field, query) {
    setLoading(true)
    setError(null)
    try {
      const data = await searchBooks(field, query)
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
        <h1>Buscador de libros</h1>
        <p>
          Búsqueda de metadatos de libros mediante la API pública de{' '}
          <a href="https://openlibrary.org/developers/api" target="_blank" rel="noreferrer">
            Open Library
          </a>
          .
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