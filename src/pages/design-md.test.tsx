// @vitest-environment jsdom
// Testes de interface do editor do gerador de DESIGN.md (etapa 3).
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { computeAccessibleDescription } from 'dom-accessibility-api'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { DRAFT_STORAGE_KEY } from '@/features/design-md/model/storage'

import { designMdOutput, lintSummary } from '@/features/design-md/test/ui'

import { DesignMdPage } from './design-md'

const output = () => designMdOutput()
const expectOutput = (text: string) => waitFor(() => expect(output().textContent).toContain(text))
const colorsSection = () => screen.getByRole('region', { name: /Cores/ })
/** Fieldset (grupo) de um token, identificado pela legenda "cor primary". */
const tokenGroup = (legend: string) => screen.getByRole('group', { name: legend })

function setup() {
  const user = userEvent.setup()
  render(<DesignMdPage />)
  return { user }
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('editor do DESIGN.md', () => {
  it('abre com o exemplo da ACME e o DESIGN.md gerado', async () => {
    setup()

    expect(screen.getByLabelText('Nome do design system')).toHaveProperty('value', 'ACME')
    expect(screen.getByRole('button', { name: /Cores, 7 itens/ })).toBeTruthy()
    expect(screen.getByText(/Começando pelo exemplo da ACME/)).toBeTruthy()
    await expectOutput('name: ACME')
    expect(lintSummary().textContent).toMatch(/0 erros.*0 avisos.*5 informações/)
  })

  it('começa com um passo a passo curto de uso', () => {
    setup()

    const steps = within(screen.getByRole('region', { name: 'Como usar' })).getAllByRole('listitem')
    expect(steps.map((step) => step.textContent?.split(' ').slice(0, 3).join(' '))).toEqual([
      'Em Identidade, troque',
      'Escolha a cor',
      'Confira o resultado',
      'Em Orientações, descreva',
      'Clique em Baixar',
    ])
    expect(screen.getByRole('link', { name: 'projeto' }).getAttribute('href')).toBe('#/projetos')
  })

  it('nome vazio mostra erro ligado ao campo e conta no resumo', async () => {
    const { user } = setup()
    const name = screen.getByLabelText('Nome do design system')

    await user.clear(name)

    await waitFor(() => expect(name.getAttribute('aria-invalid')).toBe('true'))
    // Descrição lida pelo leitor de tela, com o espaço depois do prefixo oculto.
    expect(computeAccessibleDescription(name)).toBe('Erro: O nome do design system é obrigatório.')
    expect(lintSummary().textContent).toContain('1 erro')
    expect(screen.getByRole('button', { name: /^Identidade/ }).textContent).toContain('1 erro')
  })

  it('adicionar cor foca o novo campo e atualiza contagem e saída', async () => {
    const { user } = setup()

    await user.click(within(colorsSection()).getByRole('button', { name: 'Adicionar cor' }))

    await waitFor(() => expect(document.activeElement).toBe(within(tokenGroup('cor cor-1')).getByLabelText('Nome')))
    expect(screen.getByRole('button', { name: /Cores, 8 itens/ })).toBeTruthy()
    await expectOutput('cor-1: "#000000"')
  })

  it('renomear cor atualiza as referências dos componentes', async () => {
    const { user } = setup()
    const nameInput = within(tokenGroup('cor tertiary')).getByLabelText('Nome')

    await user.clear(nameInput)
    await user.type(nameInput, 'brand')

    await expectOutput('backgroundColor: "{colors.brand}"')
    expect(output().textContent).not.toContain('{colors.tertiary}')
  })

  it('remover cor em uso pede confirmação e deixa o erro visível', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'Remover cor tertiary' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText('button-primary')).toBeTruthy()
    expect(within(dialog).getByText('button-secondary')).toBeTruthy()
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancelar' }))

    await user.click(within(dialog).getByRole('button', { name: 'Remover mesmo assim' }))

    await expectOutput('backgroundColor: "{colors.tertiary}"')
    expect(screen.queryByRole('group', { name: 'cor tertiary' })).toBeNull()
    await waitFor(() => expect(lintSummary().textContent).toContain('2 erros'))
  })

  it('cancelar a remoção mantém a cor', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'Remover cor tertiary' }))
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Cancelar' }))

    expect(tokenGroup('cor tertiary')).toBeTruthy()
  })

  it('remover cor sem uso não pede confirmação e devolve o foco ao botão de adicionar', async () => {
    const { user } = setup()

    await user.click(screen.getByRole('button', { name: 'Remover cor neutral' }))

    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(screen.queryByRole('group', { name: 'cor neutral' })).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Adicionar cor' })))
  })

  it('cor inválida mostra mensagem em pt-BR junto do campo', async () => {
    const { user } = setup()
    const value = within(tokenGroup('cor border')).getByLabelText('Valor')

    await user.clear(value)
    await user.type(value, 'cinza')

    await waitFor(() => expect(value.getAttribute('aria-invalid')).toBe('true'))
    expect(within(tokenGroup('cor border')).getByText(/“cinza” não é uma cor válida/)).toBeTruthy()
  })

  it('seletor visual e campo de texto ficam sincronizados', async () => {
    setup()
    const group = tokenGroup('cor primary')
    const picker = within(group).getByLabelText('Seletor visual da cor primary') as HTMLInputElement
    const text = within(group).getByLabelText('Valor') as HTMLInputElement

    expect(picker.value).toBe('#201813')

    // O seletor nativo não é operável pelo user-event; dispara o evento de mudança diretamente.
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(picker, { target: { value: '#123abc' } })

    expect(text.value).toBe('#123ABC')
    await expectOutput('primary: "#123ABC"')
  })

  it('tipografia: peso inválido mostra erro do lint no campo', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /Tipografia/ }))
    const weight = within(tokenGroup('estilo h1')).getByLabelText('Peso')

    await user.clear(weight)
    await user.type(weight, 'negrito')

    await waitFor(() => expect(within(tokenGroup('estilo h1')).getByText(/não é um peso de fonte válido/)).toBeTruthy())
  })

  it('tipografia sugere o Google Fonts com link que abre em nova aba', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /^Tipografia/ }))

    const link = screen.getByRole('link', { name: 'Google Fonts (abre em nova aba)' })
    expect(link.getAttribute('href')).toBe('https://fonts.google.com/')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('espaçamento: valor inválido é sinalizado pelo editor', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: /Espaçamento/ }))
    const value = within(tokenGroup('nível md')).getByLabelText('Valor')

    await user.clear(value)
    await user.type(value, '24 px')

    await waitFor(() => expect(value.getAttribute('aria-invalid')).toBe('true'))
  })

  it('salva o rascunho no navegador e o recupera ao voltar', async () => {
    const { user } = setup()
    const name = screen.getByLabelText('Nome do design system')
    await user.clear(name)
    await user.type(name, 'Meu sistema')

    await waitFor(() => expect(localStorage.getItem(DRAFT_STORAGE_KEY)).toContain('Meu sistema'), { timeout: 2000 })

    cleanup()
    render(<DesignMdPage />)
    expect(screen.getByLabelText('Nome do design system')).toHaveProperty('value', 'Meu sistema')
    expect(screen.getByText(/Continuando o rascunho salvo/)).toBeTruthy()
  })
})
