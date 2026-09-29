// @vitest-environment jsdom
// Testes de interface das orientações em linguagem natural.
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { designMdOutput, lintSummary } from '@/features/design-md/test/ui'

import { DesignMdPage } from './design-md'

const output = () => designMdOutput().textContent ?? ''
const headings = () => [...output().matchAll(/^## (.+)$/gm)].map((match) => match[1])
const field = (label: string) => screen.getByLabelText(label) as HTMLTextAreaElement

async function setup() {
  const user = userEvent.setup()
  render(<DesignMdPage />)
  await user.click(screen.getByRole('button', { name: /^Orientações/ }))
  return { user }
}

beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('orientações', () => {
  it('tem só os campos Visão geral e O que fazer e o que evitar, sem instruções de Markdown', async () => {
    await setup()

    const section = screen.getByRole('region', { name: /^Orientações/ })
    expect([...section.querySelectorAll('textarea')].map((textarea) => textarea.labels?.[0]?.textContent)).toEqual([
      'Visão geral',
      'O que fazer e o que evitar',
    ])
    expect(section.textContent).not.toMatch(/Markdown|Elevação|Notas complementares/)
  })

  it('mostra o conteúdo de exemplo da ACME', async () => {
    await setup()

    expect(field('Visão geral').value).toContain('laranja vibrante')
    expect(field('O que fazer e o que evitar').value.split('\n')).toEqual([
      'Use um único botão laranja por tela, na ação principal.',
      'Não use mais de dois tamanhos de título na mesma tela.',
    ])
  })

  it('editar a visão geral atualiza a seção Overview, preservando as quebras de linha', async () => {
    const { user } = await setup()
    const overview = field('Visão geral')

    await user.clear(overview)
    await user.type(overview, 'Primeira linha{Enter}Segunda linha')

    await waitFor(() => expect(output()).toContain('## Overview\n\nPrimeira linha\nSegunda linha\n\n## Colors'))
  })

  it('cada linha de "O que fazer e o que evitar" vira um item de lista, sem precisar de Markdown', async () => {
    const { user } = await setup()
    const rules = field('O que fazer e o que evitar')

    await user.clear(rules)
    await user.type(rules, 'Regra A{Enter}{Enter}Regra B')

    await waitFor(() => expect(output()).toContain("## Do's and Don'ts\n\n- Regra A\n- Regra B\n"))
  })

  it('campos vazios não geram seção', async () => {
    const { user } = await setup()

    await user.clear(field('Visão geral'))
    await user.clear(field('O que fazer e o que evitar'))

    await waitFor(() => expect(headings()).toEqual(['Colors', 'Typography', 'Layout', 'Shapes', 'Components']))
  })

  it('títulos digitados no texto viram texto comum e a ordem das seções é mantida', async () => {
    const { user } = await setup()
    const overview = field('Visão geral')

    await user.clear(overview)
    await user.type(overview, '## Colors{Enter}Texto')

    await waitFor(() => expect(output()).toContain('## Overview\n\n\\## Colors\nTexto'))
    expect(headings()).toEqual(['Overview', 'Colors', 'Typography', 'Layout', 'Shapes', 'Components', "Do's and Don'ts"])
    expect(lintSummary().textContent).toContain('0 erros')
  })
})
