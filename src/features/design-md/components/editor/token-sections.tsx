// Seções do editor para os grupos de tokens: cores, tipografia, espaçamento e arredondamento.
import { ExternalLink } from 'lucide-react'

import { fieldIds } from '../../model/field-ids'
import type { DraftAction } from '../../model/reducer'
import type { Draft } from '../../model/types'
import { ColorValueField } from './color-value-field'
import { EditorSection } from './editor-section'
import { TextField } from './text-field'
import { TokenList } from './token-list'

type SectionProps = { draft: Draft; dispatch: (action: DraftAction) => void }


export function ColorsSection({ draft, dispatch, resolvedColors }: SectionProps & { resolvedColors: Map<string, string> }) {
  return (
    <EditorSection value="colors" title="Cores" count={draft.colors.length} errorPrefixes={['colors-', 'group-colors']}>
      <TokenList
        group="colors"
        draft={draft}
        dispatch={dispatch}
        hint="Aceita qualquer cor CSS: hex (#CC4D00), rgb(), hsl(), oklch(), nomes como transparent…"
        renderFields={(token) => (
          <div className="grid gap-sm sm:grid-cols-2">
            <TextField
              fieldId={fieldIds.token('colors', token.id, 'name')}
              label="Nome"
              value={token.name}
              onChange={(event) =>
                dispatch({ type: 'updateToken', group: 'colors', id: token.id, patch: { name: event.target.value } })
              }
            />
            <ColorValueField
              fieldId={fieldIds.token('colors', token.id, 'value')}
              tokenName={token.name}
              value={token.value}
              resolvedHex={resolvedColors.get(token.name)}
              onChange={(value) => dispatch({ type: 'updateToken', group: 'colors', id: token.id, patch: { value } })}
            />
          </div>
        )}
      />
    </EditorSection>
  )
}

export function TypographySection({ draft, dispatch }: SectionProps) {
  return (
    <EditorSection
      value="typography"
      title="Tipografia"
      count={draft.typography.length}
      errorPrefixes={['typography-', 'group-typography']}
    >
      <TokenList
        group="typography"
        draft={draft}
        dispatch={dispatch}
        hint={
          <>
            <strong className="font-semibold text-foreground">Sugestão:</strong> use fontes do{' '}
            <a
              href="https://fonts.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              // Nome explícito: texto oculto concatenado perde o espaço no cálculo do nome acessível.
              aria-label="Google Fonts (abre em nova aba)"
              className="inline-flex items-center gap-0.5 font-semibold text-tertiary-text underline underline-offset-4"
            >
              Google Fonts
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
            : são gratuitas e as ferramentas de IA costumam reconhecê-las pelo nome (ex.: DM Sans, Inter, Roboto). Tamanho
            e espaço entre letras em px, em ou rem; peso como número (400, 700); altura da linha como número (1.5) ou
            medida. Altura da linha e espaço entre letras são opcionais.
          </>
        }
        renderFields={(token) => {
          const update = (patch: Partial<typeof token>) =>
            dispatch({ type: 'updateToken', group: 'typography', id: token.id, patch })
          return (
            <div className="grid gap-sm sm:grid-cols-2 xl:grid-cols-3">
              <TextField
                fieldId={fieldIds.token('typography', token.id, 'name')}
                label="Nome"
                value={token.name}
                onChange={(event) => update({ name: event.target.value })}
              />
              <TextField
                fieldId={fieldIds.token('typography', token.id, 'fontFamily')}
                label="Fonte"
                placeholder="DM Sans"
                value={token.fontFamily}
                onChange={(event) => update({ fontFamily: event.target.value })}
              />
              <TextField
                fieldId={fieldIds.token('typography', token.id, 'fontSize')}
                label="Tamanho"
                placeholder="1rem"
                value={token.fontSize}
                onChange={(event) => update({ fontSize: event.target.value })}
              />
              <TextField
                fieldId={fieldIds.token('typography', token.id, 'fontWeight')}
                label="Peso"
                placeholder="400"
                inputMode="numeric"
                value={token.fontWeight}
                onChange={(event) => update({ fontWeight: event.target.value })}
              />
              <TextField
                fieldId={fieldIds.token('typography', token.id, 'lineHeight')}
                label="Altura da linha"
                placeholder="1.5"
                value={token.lineHeight}
                onChange={(event) => update({ lineHeight: event.target.value })}
              />
              <TextField
                fieldId={fieldIds.token('typography', token.id, 'letterSpacing')}
                label="Espaço entre letras"
                placeholder="-0.02em"
                value={token.letterSpacing}
                onChange={(event) => update({ letterSpacing: event.target.value })}
              />
            </div>
          )
        }}
      />
    </EditorSection>
  )
}

const SCALE_COPY = {
  spacing: {
    title: 'Espaçamento',
    hint: 'Escala de espaçamentos (margens, distâncias entre elementos). Use px, em ou rem (ex.: 8px) ou um número sem unidade.',
    placeholder: '8px',
  },
  rounded: {
    title: 'Arredondamento',
    hint: 'Escala de raios de canto. Use px, em ou rem (ex.: 6px).',
    placeholder: '6px',
  },
} as const

export function ScaleSection({ group, draft, dispatch }: SectionProps & { group: 'spacing' | 'rounded' }) {
  const copy = SCALE_COPY[group]
  return (
    <EditorSection value={group} title={copy.title} count={draft[group].length} errorPrefixes={[`${group}-`, `group-${group}`]}>
      <TokenList
        group={group}
        draft={draft}
        dispatch={dispatch}
        hint={copy.hint}
        renderFields={(token) => (
          <div className="grid gap-sm sm:grid-cols-2">
            <TextField
              fieldId={fieldIds.token(group, token.id, 'name')}
              label="Nome"
              value={token.name}
              onChange={(event) => dispatch({ type: 'updateToken', group, id: token.id, patch: { name: event.target.value } })}
            />
            <TextField
              fieldId={fieldIds.token(group, token.id, 'value')}
              label="Valor"
              placeholder={copy.placeholder}
              className="[&_input]:font-mono"
              value={token.value}
              onChange={(event) => dispatch({ type: 'updateToken', group, id: token.id, patch: { value: event.target.value } })}
            />
          </div>
        )}
      />
    </EditorSection>
  )
}
