import { DUBLIN_CORE_ELEMENTS, toDublinCore } from '../utils/dublinCore.js'
import downloadJson from '../utils/exportJson.js'

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  const display = Array.isArray(value) ? value.join(', ') : String(value)
  return (
    <tr>
      <th>
        <code>{label}</code>
      </th>
      <td>{display}</td>
    </tr>
  )
}

function BookDetail({ book, onClose }) {
  if (!book) return null

  const dc = toDublinCore(book)

  function handleExportDc() {
    downloadJson({ id: book.id, dc }, 'dublin-core')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Metadatos del libro</h2>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={handleExportDc}>
              Descargar en JSON
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="book-cover">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={`Portada de ${book.title}`} />
            ) : (
              <span className="cover-placeholder">Sin imagen</span>
            )}
          </div>

          <div className="metadata">
            <h3>{book.title}</h3>
            <p className="metadata-note">
              Metadatos listos para persistir, en formato{' '}
              <a
                href="https://www.dublincore.org/specifications/dublin-core/dcmi-terms/"
                target="_blank"
                rel="noreferrer"
              >
                Dublin Core
              </a>
              .
            </p>

            {book.downloadLinks && book.downloadLinks.length > 0 && (
              <div className="download-section">
                <h4>Descargas</h4>
                <ul>
                  {book.downloadLinks.map((link) => (
                    <li key={link.mime}>
                      <a href={link.url} target="_blank" rel="noreferrer">
                        {link.format}
                      </a>
                    </li>
                  ))}
                  {book.url && (
                    <li>
                      <a href={book.url} target="_blank" rel="noreferrer">
                        Página de Project Gutenberg
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <table className="metadata-table">
              <tbody>
                {DUBLIN_CORE_ELEMENTS.map((element) => (
                  <DetailRow
                    key={element.key}
                    label={element.key}
                    value={dc[element.key]}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetail