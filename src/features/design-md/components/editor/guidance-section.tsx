// Orientações em linguagem natural: complementam os tokens com o "porquê" e o "como usar".
// Texto comum, sem Markdown: cada linha de "O que fazer e o que evitar" vira um item da lista.
import { fieldIds } from '../../model/field-ids'
import type { DraftAction } from '../../model/reducer'
import type { Draft, GuidanceKey } from '../../model/types'
import { EditorSection } from './editor-section'
import { TextAreaField } from './text-field'

type GuidanceField = { key: GuidanceKey; label: string; hint: string; placeholder: string }

const FIELDS: GuidanceField[] = [
  {
    key: 'overview',
    label: 'Visão geral',
    hint: 'Personalidade da marca e sensação que a interface deve passar.',
    placeholder: 'Ex.: interface limpa e acolhedora, que transmite confiança…',
  },
  {
    key: 'dosAndDonts',
    label: 'O que fazer e o que evitar',
    hint: 'Regras práticas para quem vai criar as telas. Escreva uma regra por linha.',
    placeholder: 'Use o laranja só na ação principal da tela.\nNão use mais de dois tamanhos de título por tela.',
  },
]

type SectionProps = { draft: Draft; dispatch: (action: DraftAction) => void }

export function GuidanceSection({ draft, dispatch }: SectionProps) {
  return (
    <EditorSection value="guidance" title="Orientações" errorPrefixes={['guidance-']}>
      {FIELDS.map((field) => (
        <TextAreaField
          key={field.key}
          fieldId={fieldIds.guidance(field.key)}
          label={field.label}
          hint={field.hint}
          placeholder={field.placeholder}
          value={draft.guidance[field.key]}
          onChange={(event) => dispatch({ type: 'setGuidance', key: field.key, text: event.target.value })}
        />
      ))}
    </EditorSection>
  )
}
