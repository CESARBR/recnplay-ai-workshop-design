// Prévia funcional do design system editado. Os estilos vêm só dos tokens (via `PreviewModel`)
// e ficam isolados neste contêiner: nada aqui herda ou altera o visual do site.
import { useId, type CSSProperties, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import type { PreviewComponent, PreviewComponentStyle, PreviewModel } from '../../preview/model'

/** Fundo e texto do componente pelas variáveis CSS (com o estado hover, quando houver). */
const COMPONENT_COLORS =
  'bg-[var(--preview-bg,transparent)] text-[var(--preview-fg,inherit)] hover:bg-[var(--preview-hover-bg,var(--preview-bg,transparent))] hover:text-[var(--preview-hover-fg,var(--preview-fg,inherit))]'

/** Estilo neutro e visivelmente provisório para componentes ausentes. */
const FALLBACK = 'border border-dashed border-current/40'

function FallbackNote({ name, children }: { name: PreviewComponent; children?: ReactNode }) {
  return (
    <span className="text-xs opacity-70">
      {children ?? (
        <>
          Sem componente <code>{name}</code> — estilo neutro
        </>
      )}
    </span>
  )
}

function PreviewButton({ component, name, label }: { component: PreviewComponentStyle; name: PreviewComponent; label: string }) {
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        style={component.style}
        className={cn(
          'cursor-pointer font-semibold',
          COMPONENT_COLORS,
          component.missing ? `${FALLBACK} rounded-[6px] px-5 py-3` : 'border-0',
          // Sem padding definido, um mínimo para o botão continuar reconhecível.
          !component.missing && !component.style.padding && 'px-5 py-3',
        )}
      >
        {label}
      </button>
      {component.missing && <FallbackNote name={name} />}
    </span>
  )
}

type PreviewPanelProps = { preview: PreviewModel; name: string; description: string }

export function PreviewPanel({ preview, name, description }: PreviewPanelProps) {
  const inputId = useId()
  const { components } = preview
  const card = components.card
  const input = components.input

  return (
    <div className="flex flex-col gap-sm">
      <div
        role="region"
        aria-label="Prévia do design system"
        style={preview.page}
        className="flex flex-col gap-6 overflow-hidden rounded-md border p-6"
      >
        <div className="flex flex-col gap-3">
          <p style={preview.title} className="break-words">
            {name.trim() || 'Título da página'}
          </p>
          <p style={preview.body}>
            {description.trim() || 'Este é um parágrafo de exemplo para conferir o texto corrido do design system.'}
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-3">
          <PreviewButton component={components['button-primary']} name="button-primary" label="Ação principal" />
          <PreviewButton component={components['button-secondary']} name="button-secondary" label="Ação secundária" />
        </div>

        <div className="flex flex-col gap-1">
          <div
            style={card.style as CSSProperties}
            className={cn(
              'flex flex-col gap-3',
              COMPONENT_COLORS,
              card.missing ? `${FALLBACK} rounded-[12px] p-5` : !card.style.padding && 'p-5',
            )}
          >
            <p style={{ ...preview.body, fontWeight: 700 }}>Card de exemplo</p>
            <p style={preview.body}>Conteúdo dentro de um card, com um campo de entrada.</p>
            <div className="flex flex-col gap-1">
              <label htmlFor={inputId} style={{ ...preview.body, fontSize: '0.875em', fontWeight: 600 }}>
                Campo de exemplo
              </label>
              <input
                id={inputId}
                placeholder="Digite algo…"
                style={input.style}
                className={cn(
                  'w-full min-w-0 placeholder:opacity-60',
                  COMPONENT_COLORS,
                  input.missing ? `${FALLBACK} rounded-[6px] px-3.5 py-2.5` : 'border border-current/20',
                  !input.missing && !input.style.padding && 'px-3.5 py-2.5',
                )}
              />
              {input.missing && <FallbackNote name="input" />}
            </div>
          </div>
          {card.missing && <FallbackNote name="card" />}
        </div>

        <div className="flex flex-col gap-2">
          <p style={{ ...preview.body, fontSize: '0.75rem', fontWeight: 600 }}>Cores</p>
          {preview.swatches.length ? (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-3">
              {preview.swatches.map((swatch) => (
                <li key={swatch.name} className="flex flex-col gap-1">
                  <span
                    aria-hidden
                    className={cn(
                      'h-12 rounded-[6px] border border-current/15',
                      (!swatch.css || swatch.translucent) &&
                        'bg-[repeating-conic-gradient(var(--color-border)_0_25%,var(--color-surface)_0_50%)] bg-[length:12px_12px]',
                      !swatch.css && 'border-dashed',
                    )}
                    style={swatch.css ? { boxShadow: `inset 0 0 0 100px ${swatch.css}` } : undefined}
                  />
                  <span className="text-xs font-semibold break-all" style={{ fontFamily: preview.body.fontFamily }}>
                    {swatch.name}
                  </span>
                  <span className="font-mono text-xs break-all opacity-70">
                    {swatch.value}
                    {!swatch.css && ' (inválida)'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs opacity-70">Nenhuma cor definida.</p>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        A prévia aplica os tokens atuais e os componentes <code>button-primary</code>, <code>button-secondary</code>,{' '}
        <code>card</code> e <code>input</code> (e seus estados <code>-hover</code>). As fontes só aparecem se
        estiverem instaladas neste computador: a prévia não baixa fontes.
      </p>
    </div>
  )
}
