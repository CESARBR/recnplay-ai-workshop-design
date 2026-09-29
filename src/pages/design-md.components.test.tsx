// @vitest-environment jsdom
// Testes de interface do editor de componentes (etapa 4).
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { designMdOutput } from '@/features/design-md/test/ui'

import { DesignMdPage } from './design-md'

const output = () => designMdOutput()
const expectOutput = (text: string) => waitFor(() => expect(output().textContent).toContain(text))
const expectNotInOutput = (text: string) => waitFor(() => expect(output().textContent).not.toContain(text))
const component = (name: string) => screen.getByRole('group', { name: `componente ${name}` })
const selectedText = (select: HTMLElement) => {
  const element = select as HTMLSelectElement
  return element.options[element.selectedIndex]?.textContent
}

async function setup() {
  const user = userEvent.setup()
  render(<DesignMdPage />)
  await user.click(screen.getByRole('button', { name: /Componentes/ }))
  return { user }
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('editor de componentes', () => {
  it('mostra os componentes do exemplo com as referências atuais', async () => {
    await setup()

    expect(screen.getByRole('button', { name: /Componentes, 4 itens/ })).toBeTruthy()
    const button = component('button-primary')
    expect(selectedText(within(button).getByLabelText('Fundo backgroundColor'))).toBe('tertiary — #CC4D00')
    expect(selectedText(within(button).getByLabelText('Texto textColor'))).toBe('on-tertiary — #FFFFFF')
    expect(selectedText(within(button).getByLabelText('Tipografia typography'))).toBe('Não definido')
    expect(within(button).getByLabelText('Valor personalizado de Espaçamento interno')).toHaveProperty('value', '12px 20px')
  })

  it('trocar o token atualiza a referência no DESIGN.md', async () => {
    const { user } = await setup()
    const background = within(component('card')).getByLabelText('Fundo backgroundColor')

    await user.selectOptions(background, 'neutral — #F7F8F9')

    await expectOutput('card:\n    backgroundColor: "{colors.neutral}"')
  })

  it('tipografia só oferece tokens de tipografia', async () => {
    const { user } = await setup()
    const typography = within(component('card')).getByLabelText('Tipografia typography') as HTMLSelectElement

    expect([...typography.options].map((option) => option.textContent)).toEqual([
      'Não definido',
      'h1 — DM Sans · 3rem · 700',
      'body-md — DM Sans · 1rem · 400',
      'label-caps — DM Sans · 0.75rem · 600',
    ])
    await user.selectOptions(typography, 'body-md — DM Sans · 1rem · 400')
    await expectOutput('typography: "{typography.body-md}"')
  })

  it('valor personalizado começa com o valor do token e é validado', async () => {
    const { user } = await setup()
    const card = component('card')

    await user.selectOptions(within(card).getByLabelText('Fundo backgroundColor'), 'Valor personalizado')
    const literal = within(card).getByLabelText('Valor personalizado de Fundo')
    expect(literal).toHaveProperty('value', '#FFFFFF')
    await expectOutput('card:\n    backgroundColor: "#FFFFFF"')

    await user.clear(literal)
    await user.type(literal, 'branco-gelo')
    await waitFor(() => expect(literal.getAttribute('aria-invalid')).toBe('true'))
    expect(within(card).getByText(/Cor inválida/)).toBeTruthy()
  })

  it('"Não definido" remove a propriedade do arquivo', async () => {
    const { user } = await setup()

    await user.selectOptions(within(component('input')).getByLabelText('Arredondamento rounded'), 'Não definido')

    await waitFor(() => expect(output().textContent).toMatch(/input:\n {4}backgroundColor: "\{colors.surface\}"\n {4}textColor: "\{colors.primary\}"\n {4}padding: 10px 14px/))
  })

  it('contraste baixo aparece junto do campo e some ao corrigir', async () => {
    const { user } = await setup()
    const text = within(component('card')).getByLabelText('Texto textColor')

    await user.selectOptions(text, 'border — #E8E5E3')
    await waitFor(() => expect(within(component('card')).getByText(/Contraste de 1,\d+:1 entre texto e fundo/)).toBeTruthy())

    await user.selectOptions(text, 'primary — #201813')
    await waitFor(() => expect(within(component('card')).queryByText(/Contraste de/)).toBeNull())
  })

  it('criar estado gera um componente relacionado, focado e no arquivo', async () => {
    const { user } = await setup()
    const button = component('button-primary')

    await user.click(within(button).getByRole('button', { name: 'Criar estado' }))

    const state = await waitFor(() => component('button-primary-hover'))
    await waitFor(() => expect(document.activeElement).toBe(within(state).getByLabelText('Nome do componente')))
    expect(within(state).getByText('button-primary', { selector: 'code' })).toBeTruthy()
    await expectOutput('button-primary-hover:\n    backgroundColor: "{colors.tertiary}"')
  })

  it('novo componente começa vazio, focado e com aviso', async () => {
    const { user } = await setup()

    await user.click(screen.getByRole('button', { name: 'Adicionar componente' }))

    const created = await waitFor(() => component('componente-1'))
    await waitFor(() => expect(document.activeElement).toBe(within(created).getByLabelText('Nome do componente')))
    expect(within(created).getByText('Componente sem propriedades não entra no DESIGN.md.')).toBeTruthy()
    expect(output().textContent).not.toContain('componente-1')
  })

  it('propriedades opcionais podem ser adicionadas e removidas', async () => {
    const { user } = await setup()
    const card = component('card')

    await user.selectOptions(within(card).getByLabelText('Adicionar propriedade'), 'Tamanho (size)')
    const size = within(card).getByLabelText('Tamanho size')
    await waitFor(() => expect(document.activeElement).toBe(size))
    await user.selectOptions(size, 'md — 24px')
    await expectOutput('size: "{spacing.md}"')

    await user.click(within(card).getByRole('button', { name: 'Remover a propriedade Tamanho' }))
    await expectNotInOutput('size:')
    expect(within(card).queryByLabelText('Tamanho size')).toBeNull()
  })

  it('referência a token removido aparece no select com erro', async () => {
    const { user } = await setup()

    await user.click(screen.getByRole('button', { name: 'Remover cor surface' }))
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Remover mesmo assim' }))

    const background = within(component('card')).getByLabelText('Fundo backgroundColor')
    expect(selectedText(background)).toBe('{colors.surface} — token removido')
    await waitFor(() => expect(background.getAttribute('aria-invalid')).toBe('true'))
    expect(within(component('card')).getByText(/A referência \{colors.surface\} aponta para um token que não existe/)).toBeTruthy()

    await user.selectOptions(background, 'neutral — #F7F8F9')
    await waitFor(() => expect(background.getAttribute('aria-invalid')).toBeNull())
  })

  it('renomear e remover componente refletem no arquivo', async () => {
    const { user } = await setup()
    const name = within(component('input')).getByLabelText('Nome do componente')

    await user.clear(name)
    await user.type(name, 'text-field')
    await expectOutput('text-field:')

    await user.click(within(component('text-field')).getByRole('button', { name: 'Remover componente text-field' }))
    await expectNotInOutput('text-field:')
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Adicionar componente' })))
  })
})
