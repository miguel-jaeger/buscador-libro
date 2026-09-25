function downloadJson(data, baseName = 'resultado') {
  const json = JSON.stringify(typeof data === 'string' ? JSON.parse(data) : data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

  link.href = url
  link.download = `${baseName}-${timestamp}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default downloadJson