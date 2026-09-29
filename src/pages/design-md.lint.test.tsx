// @vitest-environment jsdom
// Testes de interface do painel de problemas (etapa 6).
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { designMdOutput, lintSummary, openResultTab } from '@/features/design-md/test/ui'

import { DesignMdPage } from './design-md'

const problemsSection = (heading: RegExp) => screen.getByRole('region', { name: heading })
const problemItems = (heading: RegExp) => within(problemsSection(heading)).queryAllByRole('listitem')

function setup() {
  const user = userEvent.setup()
  render(<DesignMdPage />)
  // A aba padrão é a Prévia.
  openResultTab(/Problemas/)
  return { user }
}

/** Volta o laranja para #F76003: com texto branco dá 3,17:1 (contraste reprovado real da CLI). */
async function makeContrastFail(user: ReturnType<typeof userEvent.setup>) {
  const value = within(screen.getByRole('group', { name: 'cor tertiary' })).getByLabelText('Valor')
  await user.clear(value)
  await user.type(value, '#F76003')
  await waitFor(() => expect(problemItems(/Avisos \(2\)/)).toHaveLength(2))
  return value
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('painel de problemas', () => {
  it('aba Problemas: resumo e grupos por gravidade', () => {
    setup()

    expect(screen.getByRole('tab', { name: /Problemas \(0\)/ }).getAttribute('aria-selected')).toBe('true')
    expect(lintSummary().textContent).toMatch(/0 erros.*0 avisos.*5 informações/)
    expect(within(problemsSection(/Erros \(0\)/)).getByText('Nenhum erro. O DESIGN.md pode ser exportado.')).toBeTruthy()
    expect(within(problemsSection(/Avisos \(0\)/)).getByText('Nenhum aviso.')).toBeTruthy()
    expect(problemItems(/Informações \(5\)/)).toHaveLength(5)
  })

  it('cada achado mostra título, local, origem, regra e a mensagem original da CLI', async () => {
    const { user } = setup()
    await makeContrastFail(user)
    const contrast = problemItems(/Avisos/).find((item) => item.textContent?.includes('Componente button-primary · Texto'))!

    expect(within(contrast).getByText('Contraste insuficiente')).toBeTruthy()
    expect(within(contrast).getByText('CLI 0.4.0')).toBeTruthy()
    expect(within(contrast).getByText('contrast-ratio')).toBeTruthy()
    expect(within(contrast).getByText(/Contraste de 3,17:1 entre texto e fundo/)).toBeTruthy()
    const original = within(contrast).getByText(/has contrast ratio 3\.17:1/)
    expect(original.getAttribute('lang')).toBe('en')
    expect(original.closest('details')?.querySelector('summary')?.textContent).toBe('Mensagem original da CLI')
  })

  it('"Ir para o campo" abre a seção fechada e leva o foco ao campo', async () => {
    const { user } = setup()
    expect(screen.queryByRole('group', { name: 'componente button-secondary' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Ir para o campo Componente button-secondary · Texto' }))

    const component = await screen.findByRole('group', { name: 'componente button-secondary' })
    await waitFor(() => expect(document.activeElement).toBe(within(component).getByLabelText('Texto textColor')))
  })

  it('erro do editor aparece no painel e leva ao campo', async () => {
    const { user } = setup()
    const name = screen.getByLabelText('Nome do design system')
    await user.clear(name)

    await waitFor(() => expect(problemItems(/Erros \(1\)/)).toHaveLength(1))
    const [error] = problemItems(/Erros/)
    expect(within(error).getByText('Campo inválido')).toBeTruthy()
    expect(within(error).getByText('Editor')).toBeTruthy()
    expect(screen.getByRole('tab', { name: /Problemas \(1\)/ })).toBeTruthy()

    name.blur()
    await user.click(within(error).getByRole('button', { name: 'Ir para o campo Identidade · Nome' }))
    await waitFor(() => expect(document.activeElement).toBe(name))
  })

  it('corrigir o problema o remove da lista', async () => {
    const { user } = setup()
    const value = await makeContrastFail(user)

    await user.clear(value)
    await user.type(value, '#CC4D00')

    await waitFor(() => expect(within(problemsSection(/Avisos \(0\)/)).getByText('Nenhum aviso.')).toBeTruthy())
    expect(lintSummary().textContent).toMatch(/0 avisos/)
  })

  it('a aba DESIGN.md mostra o arquivo gerado', () => {
    setup()

    openResultTab(/DESIGN\.md/)

    expect(screen.getByRole('tab', { name: /DESIGN\.md/ }).getAttribute('aria-selected')).toBe('true')
    expect(designMdOutput().textContent).toContain('name: ACME')
  })
})
