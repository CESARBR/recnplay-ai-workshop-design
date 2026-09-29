// @vitest-environment jsdom
// Testes de interface de restaurar o exemplo (etapa 10, critério de aceitação 8).
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createInitialDraft } from '@/features/design-md/model/initial-state'
import { DRAFT_STORAGE_KEY } from '@/features/design-md/model/storage'
import { serializeDesignMd } from '@/features/design-md/serialize/design-md'
import { designMdOutput, lintSummary } from '@/features/design-md/test/ui'

import { DesignMdPage } from './design-md'

const EXAMPLE = serializeDesignMd(createInitialDraft())
const draftNotice = () => screen.getByRole('status', { name: 'Situação do rascunho' })
const preview = () => screen.getByRole('region', { name: 'Prévia do design system' })

async function editSeveralGroups(user: ReturnType<typeof userEvent.setup>) {
  const name = screen.getByLabelText('Nome do design system')
  await user.clear(name)
  await user.type(name, 'Outra marca')

  const color = within(screen.getByRole('group', { name: 'cor tertiary' })).getByLabelText('Valor')
  await user.clear(color)
  await user.type(color, '#0055AA')

  await user.click(screen.getByRole('button', { name: 'Remover cor border' }))

  await user.click(screen.getByRole('button', { name: /^Componentes/ }))
  await user.click(screen.getByRole('button', { name: 'Remover componente input' }))

  await user.click(screen.getByRole('button', { name: /^Orientações/ }))
  await user.clear(screen.getByLabelText(/Visão geral/))

  await waitFor(() => expect(designMdOutput().textContent).not.toBe(EXAMPLE))
  await waitFor(() => expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toContain('Outra marca'), { timeout: 2000 })
}

async function confirmRestore(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Restaurar exemplo' }))
  const dialog = await screen.findByRole('alertdialog', { name: 'Restaurar o exemplo da ACME?' })
  await user.click(within(dialog).getByRole('button', { name: 'Restaurar exemplo' }))
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('restaurar o exemplo', () => {
  it('pede confirmação clara, com foco em Cancelar', async () => {
    const user = userEvent.setup()
    render(<DesignMdPage />)

    await user.click(screen.getByRole('button', { name: 'Restaurar exemplo' }))

    const dialog = await screen.findByRole('alertdialog', { name: 'Restaurar o exemplo da ACME?' })
    expect(dialog.textContent).toContain('Todas as alterações serão descartadas')
    expect(dialog.textContent).toContain('O rascunho salvo neste navegador também será apagado.')
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancelar' }))
  })

  it('cancelar mantém as edições', async () => {
    const user = userEvent.setup()
    render(<DesignMdPage />)
    await editSeveralGroups(user)
    const edited = designMdOutput().textContent

    await user.click(screen.getByRole('button', { name: 'Restaurar exemplo' }))
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Cancelar' }))

    expect(designMdOutput().textContent).toBe(edited)
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toContain('Outra marca')
  })

  it('depois de editar vários grupos, restaura tudo e editor, prévia, lint e DESIGN.md concordam', async () => {
    const user = userEvent.setup()
    render(<DesignMdPage />)
    await editSeveralGroups(user)

    await confirmRestore(user)

    await waitFor(() => expect(designMdOutput().textContent).toBe(EXAMPLE))
    expect(screen.getByLabelText('Nome do design system')).toHaveProperty('value', 'ACME')
    expect(screen.getByRole('button', { name: /Cores, 7 itens/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Componentes, 4 itens/ })).toBeTruthy()
    expect(within(screen.getByRole('group', { name: 'cor tertiary' })).getByLabelText('Valor')).toHaveProperty(
      'value',
      '#CC4D00',
    )
    expect(lintSummary().textContent).toMatch(/0 erros.*0 avisos.*5 informações/)
    expect(draftNotice().textContent).toBe('Exemplo da ACME restaurado. O rascunho anterior foi apagado deste navegador.')

    // A prévia também voltou (a aba é trocada pela verificação do DESIGN.md; volta para a Prévia).
    await user.click(screen.getByRole('tab', { name: /Prévia/ }))
    expect(within(preview()).getByText('ACME')).toBeTruthy()
    expect(within(preview()).getByRole('button', { name: 'Ação principal' }).style.getPropertyValue('--preview-bg')).toBe(
      'rgb(204 77 0 / 1)',
    )
  })

  it('apaga o rascunho salvo e só volta a salvar depois de uma nova edição', async () => {
    const user = userEvent.setup()
    render(<DesignMdPage />)
    await editSeveralGroups(user)

    await confirmRestore(user)
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull()

    const name = screen.getByLabelText('Nome do design system')
    await user.type(name, ' 2')
    await waitFor(() => expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toContain('ACME 2'), { timeout: 2000 })
  })

  it('ao reabrir depois de restaurar, começa pelo exemplo', async () => {
    const user = userEvent.setup()
    render(<DesignMdPage />)
    await editSeveralGroups(user)
    await confirmRestore(user)

    cleanup()
    render(<DesignMdPage />)

    expect(screen.getByLabelText('Nome do design system')).toHaveProperty('value', 'ACME')
    expect(draftNotice().textContent).toMatch(/^Começando pelo exemplo da ACME/)
  })

  it('recria o campo da cor da marca com a primary do exemplo', async () => {
    const user = userEvent.setup()
    render(<DesignMdPage />)
    const brand = () => screen.getByLabelText('Cor da marca') as HTMLInputElement
    await user.clear(brand())
    await user.type(brand(), '#123456')

    await confirmRestore(user)

    await waitFor(() => expect(brand().value).toBe('#201813'))
  })
})
