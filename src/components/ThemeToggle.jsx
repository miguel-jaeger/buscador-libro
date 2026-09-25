function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 12a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm0-17 1.6 1.6L12 6.2l-1.6-1.6L12 2Zm8 6 1.6 1.6L12.2 12v1.6L22 20l-1.6 1.6L11 15.6z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3a9 9 0 1 0 0 18c1.1 0 2.1-.2 3-.6a9 9 0 0 1 0-16.8A9 9 0 0 0 12 3Zm0 1.5c.6 0 1.2.1 1.7.3a7.5 7.5 0 1 0 5.5 5.5 7.5 7.5 0 0 0-7.2-5.8Z"
          />
        </svg>
      )}
      <span>{isDark ? 'Claro' : 'Oscuro'}</span>
    </button>
  )
}

export default ThemeToggle