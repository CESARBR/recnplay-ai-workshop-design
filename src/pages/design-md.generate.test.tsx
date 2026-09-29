// @vitest-environment jsdom
// Testes de interface da geração a partir de uma cor (etapa 9).
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { designMdOutput } from '@/features/design-md/test/ui'

import { DesignMdPage } from './design-md'

const brandField = () => screen.getByLabelText('Cor da marca') as HTMLInputElement
const generateButton = () => screen.getByRole('button', { name: 'Gerar sistema' })
const preview = () => screen.getByRole('region', { name: 'Prévia do design system' })
const generationStatus = () => screen.getByRole('status', { name: 'Resultado da geração' })

async function setup() {
  const user = userEvent.setup()
  render(<DesignMdPage />)
  // A seção já começa aberta.
  expect(screen.getByRole('button', { name: /^Gerar a partir de uma cor/ }).getAttribute('aria-expanded')).toBe('true')
  return { user }
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('gerar a partir de uma cor', () => {
  it('começa com a cor primary atual e o seletor sincronizado', async () => {
    await setup()

    expect(brandField().value).toBe('#201813')
    const picker = screen.getByLabelText('Seletor visual da cor da marca') as HTMLInputElement
    expect(picker.value).toBe('#201813')

    fireEvent.change(picker, { target: { value: '#0055aa' } })
    expect(brandField().value).toBe('#0055AA')
  })

  it('pede confirmação explicando o que será substituído e o que será mantido', async () => {
    const { user } = await setup()
    await user.clear(brandField())
    await user.type(brandField(), '#0055AA')

    await user.click(generateButton())

    const dialog = await screen.findByRole('alertdialog', { name: 'Substituir cores, escalas e componentes?' })
    expect(dialog.textContent).toContain('vai substituir as 7 cores, os 3 espaçamentos, os 2 arredondamentos e os 4 componentes atuais')
    expect(dialog.textContent).toContain('Nome, descrição, tipografia e orientações serão mantidos.')
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancelar' }))
  })

  it('cancelar não altera nada', async () => {
    const { user } = await setup()
    const before = designMdOutput().textContent

    await user.click(generateButton())
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Cancelar' }))

    expect(designMdOutput().textContent).toBe(before)
  })

  it('confirmar atualiza editor, prévia, lint e DESIGN.md de uma vez, preservando nome e textos', async () => {
    const { user } = await setup()
    await user.clear(brandField())
    await user.type(brandField(), '#0055AA')

    await user.click(generateButton())
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Gerar e substituir' }))

    await waitFor(() => expect(generationStatus().textContent).toBe(
      'Sistema gerado a partir de #0055AA: 12 cores, 5 espaçamentos, 5 arredondamentos e 5 componentes.',
    ))
    expect(screen.getByRole('button', { name: /Cores, 12 itens/ })).toBeTruthy()
    await waitFor(() =>
      expect(within(preview()).getByRole('button', { name: 'Ação principal' }).style.getPropertyValue('--preview-bg')).toBe(
        'rgb(0 85 170 / 1)',
      ),
    )
    const output = designMdOutput().textContent ?? ''
    expect(output).toContain('primary: "#0055AA"')
    expect(output).toContain('button-primary-hover:')
    expect(output).toContain('name: ACME')
    expect(output).toContain('laranja vibrante')
  })

  it('cor inválida mostra erro no campo e não abre a confirmação', async () => {
    const { user } = await setup()
    await user.clear(brandField())
    await user.type(brandField(), 'azul')

    await user.click(generateButton())

    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(brandField().getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByText(/Informe uma cor válida/)).toBeTruthy()
  })
})
