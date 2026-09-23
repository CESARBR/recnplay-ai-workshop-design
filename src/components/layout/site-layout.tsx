import { useEffect, useRef } from 'react'
import { NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'

import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Início', end: true },
  { to: '/agentsmd', label: 'AGENTS.md' },
  { to: '/designmd', label: 'DESIGN.md' },
]

export function SiteLayout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)

  // Em SPA o leitor de tela não percebe a troca de página: ao navegar, move o foco
  // para o conteúdo principal (exceto no carregamento inicial).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus()
  }, [pathname])

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#conteudo"
        onClick={(event) => {
          // O hash router usa o # para as rotas, então o foco é movido manualmente.
          event.preventDefault()
          mainRef.current?.focus()
        }}
        className="sr-only rounded-sm bg-surface px-4 py-3 font-semibold focus:not-sr-only focus:absolute focus:top-sm focus:left-sm focus:z-50"
      >
        Pular para o conteúdo
      </a>

      <header className="border-b bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-sm px-md py-4">
          <NavLink to="/" className="flex items-center rounded-sm">
            <img
              src={`${import.meta.env.BASE_URL}logo.webp`}
              alt="CESAR — página inicial"
              width={71}
              height={40}
              className="h-10 w-auto"
            />
          </NavLink>
          <nav aria-label="Principal">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  {/* NavLink já aplica aria-current="page" no item ativo. */}
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        'inline-flex min-h-11 items-center rounded-sm px-3 text-sm font-semibold transition-colors duration-200 ease-out',
                        // Item ativo marcado pelo fundo inteiro (cor border do DESIGN.md), não só pela cor do texto.
                        isActive
                          ? 'bg-border text-foreground'
                          : 'text-muted-foreground hover:bg-neutral hover:text-foreground',
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main
        id="conteudo"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto w-full max-w-5xl flex-1 px-md py-lg focus:outline-none"
      >
        <Outlet />
      </main>

      <footer className="border-t bg-surface">
        <div className="mx-auto max-w-5xl px-md py-md text-sm text-muted-foreground">
          © 2026 CESAR
        </div>
      </footer>

      <ScrollRestoration />
    </div>
  )
}
