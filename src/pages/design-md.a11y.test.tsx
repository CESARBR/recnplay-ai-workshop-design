// @vitest-environment jsdom
// Checagens de acessibilidade da página inteira do gerador (etapa 11).
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { computeAccessibleName } from 'dom-accessibility-api'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { openResultTab } from '@/features/design-md/test/ui'

import { DesignMdPage } from './design-md'

const ALL_SECTIONS = /^(Identidade|Gerar a partir de uma cor|Cores|Tipografia|Espaçamento|Arredondamento|Componentes|Orientações)/

async function renderFullyOpen() {
  const user = userEvent.setup()
  render(<DesignMdPage />)
  // Abre todas as seções do editor para checar todos os campos.
  for (const trigger of screen.getAllByRole('button', { name: ALL_SECTIONS }))
    if (trigger.getAttribute('aria-expanded') === 'false') await user.click(trigger)
  return { user }
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('acessibilidade da página', () => {
  it.each(['preview', 'problems', 'design-md'])('aba %s: campos com nome, ids únicos e referências válidas', async (tab) => {
    await renderFullyOpen()
    openResultTab(tab === 'preview' ? /Prévia/ : tab === 'problems' ? /Problemas/ : /DESIGN\.md/)

    const controls = [...document.querySelectorAll<HTMLElement>('input, select, textarea, button')]
    // Todas as seções abertas: campos de tokens, componentes e orientações (não uma página vazia).
    expect(controls.length).toBeGreaterThan(120)
    expect(document.querySelectorAll('select').length).toBeGreaterThan(20)
    const unnamed = controls.filter((control) => !computeAccessibleName(control).trim()).map((control) => control.outerHTML.slice(0, 120))
    expect(unnamed).toEqual([])

    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id)
    expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([])

    const references = [...document.querySelectorAll('[aria-describedby], [aria-labelledby], [aria-controls]')].flatMap((element) =>
      ['aria-describedby', 'aria-labelledby', 'aria-controls'].flatMap((attribute) =>
        (element.getAttribute(attribute) ?? '').split(/\s+/).filter(Boolean),
      ),
    )
    expect(references.filter((id) => !document.getElementById(id))).toEqual([])
  })

  it('títulos seguem a hierarquia sem pular níveis', async () => {
    await renderFullyOpen()
    openResultTab(/Problemas/)

    const levels = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((heading) => Number(heading.tagName[1]))
    expect(levels[0]).toBe(1)
    levels.forEach((level, index) => {
      if (index > 0) expect(level - levels[index - 1]).toBeLessThanOrEqual(1)
    })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('campos com erro ficam marcados e descritos', async () => {
    const { user } = await renderFullyOpen()
    await user.clear(screen.getByLabelText('Nome do design system'))
    const color = within(screen.getByRole('group', { name: 'cor border' })).getByLabelText('Valor')
    await user.clear(color)
    await user.type(color, 'cinza')

    await waitFor(() => expect(document.querySelectorAll('[aria-invalid="true"]')).toHaveLength(2))
    for (const field of document.querySelectorAll<HTMLElement>('[aria-invalid="true"]'))
      expect(field.getAttribute('aria-describedby')).toBeTruthy()
  })

  it('botões de lixeira têm hover vermelho de exclusão', async () => {
    await renderFullyOpen()

    const trashButtons = [
      screen.getByRole('button', { name: 'Remover cor primary' }),
      screen.getByRole('button', { name: 'Remover estilo h1' }),
      screen.getByRole('button', { name: 'Remover componente card' }),
    ]
    for (const button of trashButtons) {
      expect(button.className).toContain('hover:bg-destructive/10')
      expect(button.className).toContain('hover:text-destructive')
    }
  })

  it('no celular, "Ver resultado" leva o foco ao painel de resultado', async () => {
    const user = userEvent.setup()
    render(<DesignMdPage />)

    await user.click(screen.getByRole('button', { name: /Ver resultado/ }))

    expect(document.activeElement).toBe(screen.getByRole('complementary', { name: 'Resultado' }))
  })
})
