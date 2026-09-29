// Utilitários dos testes de interface do gerador.
import { fireEvent, screen } from '@testing-library/react'

/** Abre uma aba do painel de resultado (o Radix ativa a aba no `mousedown`). */
export function openResultTab(name: RegExp) {
  const tab = screen.getByRole('tab', { name })
  if (tab.getAttribute('aria-selected') !== 'true') fireEvent.mouseDown(tab)
}

/** Conteúdo do DESIGN.md gerado, abrindo a aba se necessário (aba inativa não é renderizada). */
export function designMdOutput(): HTMLElement {
  const existing = screen.queryByLabelText('Conteúdo do DESIGN.md')
  if (existing) return existing
  openResultTab(/DESIGN\.md/)
  return screen.getByLabelText('Conteúdo do DESIGN.md')
}

/** Resumo de erros, avisos e informações do painel de resultado. */
export const lintSummary = () => screen.getByRole('status', { name: 'Resumo dos problemas' })
