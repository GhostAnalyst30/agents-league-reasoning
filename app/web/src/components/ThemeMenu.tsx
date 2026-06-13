import { useEffect, useRef, useState } from 'react'
import { Moon, Sparkles, Sun, Trophy, X } from 'lucide-react'
import { LEAGUE, PRODUCT_NAME } from '../branding'
import { useTheme } from '../context/ThemeContext'

export function ThemeMenu() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={theme === 'dark' ? 'Open appearance menu' : 'Open appearance menu'}
        aria-expanded={open}
        aria-haspopup="true"
        className="theme-icon-btn relative grid size-10 place-items-center rounded-sm border transition"
      >
        {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Appearance and event info"
          className="theme-menu-panel absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-md border shadow-xl"
        >
          <div className="theme-divider flex items-center justify-between border-b px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide">Appearance</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="theme-icon-btn grid size-7 place-items-center rounded-sm transition"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="p-3">
            <p className="mb-2 px-1 text-[11px] theme-muted">Choose your interface theme</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 rounded-sm border px-3 py-3 text-left transition ${
                  theme === 'dark' ? 'theme-option-active' : 'theme-option'
                }`}
              >
                <Moon className="size-4" />
                <span className="text-xs font-semibold">Dark</span>
                <span className="text-[10px] theme-muted">Default</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 rounded-sm border px-3 py-3 text-left transition ${
                  theme === 'light' ? 'theme-option-active' : 'theme-option'
                }`}
              >
                <Sun className="size-4" />
                <span className="text-xs font-semibold">Light</span>
                <span className="text-[10px] theme-muted">Day mode</span>
              </button>
            </div>
          </div>

          <div className="theme-divider border-t p-3">
            <div className="theme-promo rounded-sm border p-3">
              <div className="flex items-start gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-gradient-to-br from-indigo-500 to-cyan-500 text-white">
                  <Trophy className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-400">
                    <Sparkles className="size-3" />
                    Agents League Hackathon
                  </p>
                  <p className="mt-1 font-heading text-sm font-bold leading-tight">{PRODUCT_NAME}</p>
                  <p className="mt-1 text-[11px] leading-snug theme-muted">{LEAGUE}</p>
                  <p className="mt-2 text-[10px] leading-relaxed theme-muted">
                    Built for Microsoft Agents League 2026 — reasoning agents grounded in Foundry IQ.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
