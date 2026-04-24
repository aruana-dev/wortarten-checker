export function Header() {
  return (
    <header className="bg-white border-b-4 border-blue-300 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
        <span className="text-4xl md:text-5xl" aria-hidden>🔍</span>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">
            Wortarten-Checker
          </h1>
          <p className="text-sm md:text-base text-slate-500">
            Finde heraus, welche Wortart jedes Wort hat.
          </p>
        </div>
      </div>
    </header>
  )
}
