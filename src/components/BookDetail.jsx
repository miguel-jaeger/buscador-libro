function DetailRow({ label, value }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null
  const display = Array.isArray(value) ? value.join(', ') : value
  return (
    <tr>
      <th>{label}</th>
      <td>{display}</td>
    </tr>
  )
}

function BookDetail({ book, onClose }) {
  if (!book) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Metadatos del libro</h2>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cerrar
          </button>
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
            <table className="metadata-table">
              <tbody>
                <DetailRow label="Autores" value={book.authors} />
                <DetailRow label="Año de publicación" value={book.firstPublishYear} />
                <DetailRow label="Años de ediciones" value={book.publishYears} />
                <DetailRow label="Editoriales" value={book.publishers} />
                <DetailRow label="ISBNs" value={book.isbns} />
                <DetailRow label="Nº de páginas" value={book.pageCount} />
                <DetailRow label="Idiomas" value={book.languages} />
                <DetailRow label="Materias" value={book.subjects} />
                <DetailRow label="Acceso e-book" value={book.ebookAccess} />
                <DetailRow label="Nº de ediciones" value={book.editionCount} />
                <DetailRow label="Identificador" value={book.id} />
                {book.url && (
                  <tr>
                    <th>Enlace</th>
                    <td>
                      <a href={book.url} target="_blank" rel="noreferrer">
                        Ver en Open Library
                      </a>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetail