function formatYear(doc) {
  return doc.firstPublishYear ?? doc.publishYears[0] ?? '—'
}

function formatIsbn(doc) {
  const primary =
    doc.isbns.find((i) => i.length === 13) ?? doc.isbns.find((i) => i.length === 10)
  return primary ?? (doc.isbns.length > 0 ? doc.isbns[0] : '—')
}

function DownloadMenu({ doc }) {
  const links = doc.downloadLinks ?? []
  if (!links.length) return <span className="no-download">—</span>

  return (
    <details className="download-menu">
      <summary className="btn btn-outline btn-sm">Descargar</summary>
      <ul className="download-list">
        {links.map((link) => (
          <li key={link.mime}>
            <a href={link.url} target="_blank" rel="noreferrer">
              {link.format}
            </a>
          </li>
        ))}
        {doc.url && (
          <li>
            <a href={doc.url} target="_blank" rel="noreferrer">
              Página del libro
            </a>
          </li>
        )}
      </ul>
    </details>
  )
}

function ResultsTable({ result, onView }) {
  if (!result) return null

  const hasResults = result.items.length > 0
  const hasDownloads = result.items.some((doc) => (doc.downloadLinks ?? []).length > 0)

  return (
    <section className="results">
      <div className="results-header">
        <h2>Resultados</h2>
        <span className="results-count">
          {result.numFound.toLocaleString('es-PA')} libro(s) encontrado(s)
        </span>
      </div>

      {!hasResults ? (
        <p className="empty">No se encontraron resultados para la búsqueda.</p>
      ) : (
        <div className="table-wrapper">
          <table className="result-table">
            <thead>
              <tr>
                <th>Portada</th>
                <th>Título</th>
                <th>Autor(es)</th>
                <th>Año</th>
                <th>Editorial</th>
                <th>ISBN</th>
                <th>Páginas</th>
                {hasDownloads && <th>Descargar</th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((doc) => (
                <tr key={doc.id + formatIsbn(doc)}>
                  <td>
                    {doc.coverUrl ? (
                      <img
                        className="cover-thumb"
                        src={doc.coverUrl}
                        alt={`Portada de ${doc.title}`}
                      />
                    ) : (
                      <span className="cover-placeholder">Sin imagen</span>
                    )}
                  </td>
                  <td>{doc.title}</td>
                  <td>{doc.authors.join(', ') || '—'}</td>
                  <td>{formatYear(doc)}</td>
                  <td>{doc.publishers[0] ?? '—'}</td>
                  <td className="isbn-cell">{formatIsbn(doc)}</td>
                  <td>{doc.pageCount ?? '—'}</td>
                  {hasDownloads && (
                    <td>
                      <DownloadMenu doc={doc} />
                    </td>
                  )}
                  <td>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => onView(doc)}
                    >
                      Ver metadatos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default ResultsTable