# Buscador de libros

Aplicación web en **React** que permite buscar los metadatos de un libro a través de la
API pública de [Open Library](https://openlibrary.org/developers/api), guardar el
resultado en un fichero **JSON** y visualizarlo en una tabla con opción de ver el detalle
completo de metadatos.

> **Nota sobre la API:** se eligió Open Library en lugar de la API de la Biblioteca del
> Congreso de los EE. UU. porque esta última bloquea las peticiones directas desde el
> navegador (protección Cloudflare), mientras que Open Library expone CORS y ofrece
> búsquedas por ISBN, título, autor, materia, OCLC, LCCN, entre otras.

## Características

- Búsqueda por **ISBN**, título, palabra clave, autor, editorial, materia, OCLC o LCCN.
- Tabla de resultados con portada, título, autor(es), año, editorial, ISBN y páginas.
- **Ver metadatos**: modal con el detalle completo del libro en formato **Dublin Core**
  (los 15 elementos `dc:*`), listo para persistir en una base de datos.
- **Guardar en JSON**: descarga el resultado de la búsqueda a un fichero `*.json`.
- **Guardar en Dublin Core (JSON)**: descarga los resultados mapeados a los 15 elementos
  Dublin Core (`dc:title`, `dc:creator`, `dc:subject`, `dc:date`, etc.).

## Tecnologías

- [Vite](https://vite.dev/) + [React](https://react.dev/)
- API: [Open Library Search API](https://openlibrary.org/dev/docs/api/search)

## Puesta en marcha

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173` en el navegador.

## Scripts

| Comando       | Descripción                         |
| ------------- | ----------------------------------- |
| `npm run dev` | Servidor de desarrollo (HMR)        |
| `npm run build` | Build de producción en `dist/`    |
| `npm run lint`  | Análisis estático con oxlint      |
| `npm run preview` | Previsualiza el build             |

## Ejemplo de uso

1. Selecciona el campo **ISBN** y escribe `9780451524935` (1984, George Orwell).
2. Pulsa **Buscar**; los resultados aparecen en la tabla.
3. Usa **Ver metadatos** para inspeccionar el detalle completo (elementos `dc:*`).
4. Usa **Descargar en JSON** en el modal para guardar el registro Dublin Core del libro.
5. Usa **Guardar resultados en JSON** o **Guardar resultados en Dublin Core (JSON)**
   para descargar el fichero con todos los datos.

## Flujo de trabajo (Git Branching)

Este proyecto sigue el modelo **feature branch workflow** de GitHub:

```
main
 └── dev
      └── feature/buscador-libro
```

- Cada funcionalidad se implementó y commiteó por separado en `feature/buscador-libro`.
- La rama `feature` se integró a `dev` tras probar el build y la API.
- `dev` se integró a `main` una vez validado.