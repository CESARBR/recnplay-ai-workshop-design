// @vitest-environment jsdom
// Testes de interface da prévia (etapa 7).
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { openResultTab } from '@/features/design-md/test/ui'

import { DesignMdPage } from './design-md'

const preview = () => screen.getByRole('region', { name: 'Prévia do design system' })
const tokenGroup = (legend: string) => screen.getByRole('group', { name: legend })

function setup() {
  const user = userEvent.setup()
  render(<DesignMdPage />)
  return { user }
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('prévia', () => {
  it('é a aba padrão e mostra os elementos de exemplo', () => {
    setup()

    expect(screen.getByRole('tab', { name: /Prévia/ }).getAttribute('aria-selected')).toBe('true')
    const region = preview()
    expect(within(region).getByText('ACME')).toBeTruthy()
    expect(within(region).getByText(/aplicativos simples para organizar/)).toBeTruthy()
    expect(within(region).getByRole('button', { name: 'Ação principal' })).toBeTruthy()
    expect(within(region).getByRole('button', { name: 'Ação secundária' })).toBeTruthy()
    expect(within(region).getByText('Card de exemplo')).toBeTruthy()
    expect(within(region).getAllByRole('listitem')).toHaveLength(7)
  })

  it('o campo de exemplo é funcional', async () => {
    const { user } = setup()
    const input = within(preview()).getByLabelText('Campo de exemplo')

    await user.type(input, 'teste')

    expect(input).toHaveProperty('value', 'teste')
  })

  it('reflete alterações dos tokens sem recarregar', async () => {
    const { user } = setup()
    const primaryButton = () => within(preview()).getByRole('button', { name: 'Ação principal' })
    expect(primaryButton().style.getPropertyValue('--preview-bg')).toBe('rgb(204 77 0 / 1)')

    const value = within(tokenGroup('cor tertiary')).getByLabelText('Valor')
    await user.clear(value)
    await user.type(value, '#0055AA')

    await waitFor(() => expect(primaryButton().style.getPropertyValue('--preview-bg')).toBe('rgb(0 85 170 / 1)'))

    const name = screen.getByLabelText('Nome do design system')
    await user.clear(name)
    await user.type(name, 'Minha marca')
    await waitFor(() => expect(within(preview()).getByText('Minha marca')).toBeTruthy())
  })

  it('componente ausente usa estilo neutro sinalizado na prévia e no painel', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /^Componentes/ }))
    const name = within(screen.getByRole('group', { name: 'componente card' })).getByLabelText('Nome do componente')

    await user.clear(name)
    await user.type(name, 'painel')

    await waitFor(() => expect(within(preview()).getByText(/Sem componente/).textContent).toBe('Sem componente card — estilo neutro'))
    openResultTab(/Problemas/)
    expect(screen.getByText('Prévia com estilo neutro')).toBeTruthy()
  })

  it('valor inválido não trava a prévia', async () => {
    const { user } = setup()
    const value = within(tokenGroup('cor surface')).getByLabelText('Valor')

    await user.clear(value)
    await user.type(value, 'nada')

    await waitFor(() => expect(within(preview()).getByText(/nada \(inválida\)/)).toBeTruthy())
    expect(within(preview()).getByText('Card de exemplo')).toBeTruthy()
  })
})
