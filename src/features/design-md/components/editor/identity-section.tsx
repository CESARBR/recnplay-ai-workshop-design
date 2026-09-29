import { fieldIds } from '../../model/field-ids'
import type { DraftAction } from '../../model/reducer'
import type { Draft } from '../../model/types'
import { EditorSection } from './editor-section'
import { TextAreaField, TextField } from './text-field'

type SectionProps = { draft: Draft; dispatch: (action: DraftAction) => void }

export function IdentitySection({ draft, dispatch }: SectionProps) {
  return (
    <EditorSection value="identity" title="Identidade" errorPrefixes={['identity-']}>
      <TextField
        fieldId={fieldIds.identity('name')}
        label="Nome do design system"
        required
        aria-required
        value={draft.name}
        onChange={(event) => dispatch({ type: 'setName', name: event.target.value })}
      />
      <TextAreaField
        fieldId={fieldIds.identity('description')}
        label="Descrição (opcional)"
        hint="Aparece no início do DESIGN.md e ajuda a IA a entender o contexto da marca."
        value={draft.description}
        onChange={(event) => dispatch({ type: 'setDescription', description: event.target.value })}
      />
    </EditorSection>
  )
}
