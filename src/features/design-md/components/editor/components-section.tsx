import { useState } from 'react'
import { CopyPlus, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'

import { fieldIds } from '../../model/field-ids'
import { createId } from '../../model/ids'
import type { DraftAction } from '../../model/reducer'
import { PROPERTY_LABEL } from '../../model/rules'
import type { ComponentDef, ComponentProperty, Draft } from '../../model/types'
import type { DesignSystemState, ResolvedComponent } from '../../official'
import { ComponentPropertyField } from './component-property-field'
import { EditorSection } from './editor-section'
import { focusFieldSoon } from './focus'
import { TextField } from './text-field'

/** Propriedades mostradas em todo componente (as do gerador de referência). */
const MAIN_PROPERTIES = ['backgroundColor', 'textColor', 'typography', 'rounded', 'padding'] as const
/** Propriedades oficiais adicionais, mostradas só quando usadas. */
const OPTIONAL_PROPERTIES = ['size', 'height', 'width'] as const satisfies readonly ComponentProperty[]
type OptionalProperty = (typeof OPTIONAL_PROPERTIES)[number]

/** Estados comuns; cada um vira um componente separado: `<base>-<estado>`. */
const COMPONENT_STATES = ['hover', 'active', 'pressed', 'focus', 'disabled'] as const

/** Se o componente é um estado de outro (ex.: `button-primary-hover` → `button-primary`). */
export function baseComponentName(name: string, components: ComponentDef[]): string | undefined {
  const statePattern = new RegExp(`-(?:${COMPONENT_STATES.join('|')})(?:-\\d+)?$`)
  const match = statePattern.exec(name)
  if (!match) return undefined
  const base = name.slice(0, match.index)
  return components.some((component) => component.name === base) ? base : undefined
}

type ComponentCardProps = {
  component: ComponentDef
  draft: Draft
  dispatch: (action: DraftAction) => void
  resolved?: ResolvedComponent
}

function ComponentCard({ component, draft, dispatch, resolved }: ComponentCardProps) {
  const name = component.name.trim() || 'sem nome'
  const base = baseComponentName(component.name, draft.components)
  const [shownOptional, setShownOptional] = useState<OptionalProperty[]>(() =>
    OPTIONAL_PROPERTIES.filter((property) => component.properties[property]),
  )
  const hiddenOptional = OPTIONAL_PROPERTIES.filter((property) => !shownOptional.includes(property))
  const [state, setState] = useState<(typeof COMPONENT_STATES)[number]>('hover')
  const stateSelectId = `${fieldIds.component(component.id, 'name')}-state`
  const addPropertyId = `${fieldIds.component(component.id, 'name')}-add-property`

  const showOptional = (property: OptionalProperty) => {
    setShownOptional((current) => [...current, property])
    focusFieldSoon(fieldIds.component(component.id, property))
  }
  const hideOptional = (property: OptionalProperty) => {
    setShownOptional((current) => current.filter((candidate) => candidate !== property))
    dispatch({ type: 'setComponentProperty', id: component.id, property, value: undefined })
    focusFieldSoon(addPropertyId)
  }

  const createState = () => {
    const newId = createId()
    dispatch({ type: 'addComponentState', id: component.id, state, newId })
    focusFieldSoon(fieldIds.component(newId, 'name'))
  }

  const remove = () => {
    dispatch({ type: 'removeComponent', id: component.id })
    focusFieldSoon(fieldIds.group('components'))
  }

  return (
    <fieldset className="flex flex-col gap-md rounded-sm border bg-neutral p-4">
      <legend className="sr-only">componente {name}</legend>

      <div className="flex flex-col gap-sm">
        <TextField
          fieldId={fieldIds.component(component.id, 'name')}
          label="Nome do componente"
          value={component.name}
          onChange={(event) => dispatch({ type: 'renameComponent', id: component.id, name: event.target.value })}
        />
        {base && (
          <Badge variant="secondary">
            Estado de <code>{base}</code>
          </Badge>
        )}
      </div>

      <div className="grid gap-md sm:grid-cols-2">
        {[...MAIN_PROPERTIES, ...shownOptional].map((property) => (
          <ComponentPropertyField
            key={property}
            component={component}
            property={property}
            draft={draft}
            dispatch={dispatch}
            resolved={resolved?.properties.get(property)}
            onRemove={
              (OPTIONAL_PROPERTIES as readonly string[]).includes(property)
                ? () => hideOptional(property as OptionalProperty)
                : undefined
            }
          />
        ))}
      </div>

      {/* Rodapé em linhas separadas: propriedades opcionais, depois estados e remoção. */}
      <div className="flex flex-col gap-md border-t pt-4">
        {hiddenOptional.length > 0 && (
          <div className="flex max-w-[20rem] flex-col gap-1.5">
            <Label htmlFor={addPropertyId}>Adicionar propriedade</Label>
            <NativeSelect
              id={addPropertyId}
              value=""
              onChange={(event) => event.target.value && showOptional(event.target.value as OptionalProperty)}
            >
              <NativeSelectOption value="">Escolha…</NativeSelectOption>
              {hiddenOptional.map((property) => (
                <NativeSelectOption key={property} value={property}>
                  {PROPERTY_LABEL[property]} ({property})
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
        )}

        <div className="flex flex-wrap items-end gap-sm">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={stateSelectId}>Estado</Label>
            <div className="flex gap-sm">
              <NativeSelect
                id={stateSelectId}
                className="w-36"
                value={state}
                onChange={(event) => setState(event.target.value as typeof state)}
              >
                {COMPONENT_STATES.map((option) => (
                  <NativeSelectOption key={option} value={option}>
                    {option}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Button type="button" variant="outline" onClick={createState}>
                <CopyPlus /> Criar estado
              </Button>
            </div>
          </div>

          <Button type="button" variant="destructive-ghost" className="ml-auto" onClick={remove}>
            <Trash2 /> Remover componente <span className="sr-only">{name}</span>
          </Button>
        </div>
      </div>
    </fieldset>
  )
}

type ComponentsSectionProps = {
  draft: Draft
  dispatch: (action: DraftAction) => void
  resolvedComponents?: DesignSystemState['components']
}

export function ComponentsSection({ draft, dispatch, resolvedComponents }: ComponentsSectionProps) {
  const add = () => {
    const id = createId()
    dispatch({ type: 'addComponent', id })
    focusFieldSoon(fieldIds.component(id, 'name'))
  }

  return (
    <EditorSection
      value="components"
      title="Componentes"
      count={draft.components.length}
      errorPrefixes={['components-', 'group-components']}
    >
      <p className="text-sm text-muted-foreground">
        Cada componente liga suas propriedades a tokens (ou a um valor personalizado). Estados como hover são
        componentes separados, com o nome do componente seguido do estado — por exemplo,{' '}
        <code>button-primary-hover</code>.
      </p>

      {draft.components.length ? (
        <ul className="flex flex-col gap-sm">
          {draft.components.map((component) => (
            <li key={component.id}>
              <ComponentCard
                component={component}
                draft={draft}
                dispatch={dispatch}
                resolved={resolvedComponents?.get(component.name)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">Nenhum componente definido.</p>
      )}

      <div>
        <Button type="button" variant="outline" id={fieldIds.group('components')} onClick={add}>
          <Plus /> Adicionar componente
        </Button>
      </div>
    </EditorSection>
  )
}
