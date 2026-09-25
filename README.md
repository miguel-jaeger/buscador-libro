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

## Arquitectura y funciones clave

El flujo de datos es: **búsqueda → limpieza → presentación → exportación**.

```
SearchForm ──► App.handleSearch ──► searchBooks() ──► normalize() ──► tabla / modal
                                                          │
                                                   (items limpios)
                                                          │
            ┌───────────────────────┬─────────────────────┘
            ▼                       ▼
   exportJson (JSON crudo)   dublinCore (JSON DC)
```

### 1. Búsqueda: `searchBooks(field, query)` — `src/services/openLibrary.js`

Es la función encargada de consultar la API pública de **Open Library**:

- Construye la URL con `buildParams()` según el **campo** seleccionado (`isbn`, `title`,
  `author`, `publisher`, `subject`, `oclc`, `lccn` o `q` para texto libre) y el **valor**
  escrito por el usuario.
- Hace `fetch` con un `User-Agent` identificativo y envía el parámetro `fields` para
  pedir solo los campos necesarios (`title`, `author_name`, `isbn`, `oclc`, `lccn`,
  `publisher`, `language`, `subject`, `cover_i`, etc.).
- Retorna un objeto con `numFound`, `startedAt`, `q` y `items` (arreglo de libros ya
  normalizados) más la respuesta cruda en `raw`.

### 2. Limpieza de datos: `normalize(doc)` — `src/services/openLibrary.js`

Se aplica a **cada documento** que devuelve la API para dejarlo listo antes de mostrar o
exportar:

- Traduce los nombres de la API (`author_name` → `authors`, `number_of_pages_median` →
  `pageCount`, ...) a una estructura de datos estable y consistente.
- Convierte valores ausentes en arreglos vacíos o `null` (nunca `undefined`), lo que
  evita errores en la UI y garantiza un JSON predecible.
- Genera campos derivados como `coverUrl` (portada) y `url` (enlace al registro).
- En `buildParams` se solicitan además `oclc` y `lccn` para enriquecer los identificadores.

### 3. Preparación para exportar

Existen **dos formatos** de salida, ambos descargan un fichero `.json`:

#### a) JSON crudo de la búsqueda — `handleExport()` en `src/App.jsx`

- Llama a `downloadJson(result, 'busqueda-libros')`.
- `downloadJson()` — `src/utils/exportJson.js` — serializa el dato con `JSON.stringify`
  (indentado a 2 espacios), lo envuelve en un `Blob` de tipo `application/json` y
  dispara la descarga con un nombre con marca de tiempo.
- Contiene el resultado completo: `numFound`, `items` normalizados y `raw` (la respuesta
  íntegra de la API).

#### b) JSON en formato Dublin Core — `handleExportDublinCore()` en `src/App.jsx`

- Convierte todos los `items` a registros Dublin Core mediante `toDublinCoreList(items)`.
- Cada registro tiene forma `{ id, dc: { 'dc:title': …, 'dc:creator': …, ... } }`.
- `toDublinCore(book)` — `src/utils/dublinCore.js` — mapea cada libro a los **15
  elementos DCMI** (`dc:title`, `dc:creator`, `dc:subject`, `dc:description`,
  `dc:publisher`, `dc:contributor`, `dc:date`, `dc:type`, `dc:format`, `dc:identifier`,
  `dc:source`, `dc:language`, `dc:relation`, `dc:coverage`, `dc:rights`).
- La **limpieza específica para BD** se realiza aquí: `unique()` elimina valores
  repetidos (la API devuelve autores/materias duplicados), se acotan cantidades
  (hasta 10 autores, 20 materias, 10 editoriales), `buildIdentifiers()` reduce los
  cientos de OCLC/LCCN al identificador principal, y las fechas se normalizan a formato
  W3C en `toW3CDate()`.
- El paquete de descarga incluye `schemas` con la URI del Dublin Core para que el fichero
  pueda importarse tal cual en una base de datos o catálogo.
- En el modal de **Ver metadatos**, `BookDetail.jsx` usa la misma `toDublinCore(book)`
  para mostrar el registro DC del libro y permite descargarlo individualmente con
  `handleExportDc()`.

## Flujo de datos de entrada y salida

| Etapa          | Función principal                  | Archivo                       |
| -------------- | ---------------------------------- | ----------------------------- |
| Búsqueda       | `searchBooks(field, query)`        | `src/services/openLibrary.js` |
| Limpieza       | `normalize(doc)`                   | `src/services/openLibrary.js` |
| Tabla/Detalle  | `ResultsTable`, `BookDetail`       | `src/components/*`            |
| Export JSON    | `downloadJson(data, nombre)`       | `src/utils/exportJson.js`     |
| Export DC      | `toDublinCore` / `toDublinCoreList`| `src/utils/dublinCore.js`     |

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