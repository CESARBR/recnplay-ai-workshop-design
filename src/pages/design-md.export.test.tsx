// @vitest-environment jsdom
// Testes de interface de copiar e baixar o DESIGN.md (etapa 8).
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { designMdOutput } from '@/features/design-md/test/ui'

import { DesignMdPage } from './design-md'

const downloadButton = () => screen.getByRole('button', { name: 'Baixar DESIGN.md' })
const copyButton = () => screen.getByRole('button', { name: 'Copiar' })
const exportStatus = () => screen.getByRole('status', { name: 'Resultado da exportação' })

let downloads: { href: string; download: string }[]
let blobs: Blob[]
const originalExecCommand = document.execCommand

beforeEach(() => {
  localStorage.clear()
  downloads = []
  blobs = []
  URL.createObjectURL = vi.fn((blob: Blob) => {
    blobs.push(blob)
    return `blob:design-md-${blobs.length}`
  })
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    downloads.push({ href: this.href, download: this.download })
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  document.execCommand = originalExecCommand
})

function setup() {
  const user = userEvent.setup()
  render(<DesignMdPage />)
  return { user }
}

describe('exportar o DESIGN.md', () => {
  it('"Baixar DESIGN.md" é a única ação principal (tertiary) da tela', () => {
    setup()

    const primaryButtons = [...document.querySelectorAll('button, a')].filter((element) =>
      element.className.split(' ').includes('bg-primary'),
    )
    expect(primaryButtons).toEqual([downloadButton()])
  })

  it('baixa exatamente o conteúdo mostrado, como DESIGN.md em UTF-8', async () => {
    const { user } = setup()
    const shown = designMdOutput().textContent

    await user.click(downloadButton())

    expect(downloads).toEqual([{ href: 'blob:design-md-1', download: 'DESIGN.md' }])
    expect(blobs[0].type).toBe('text/markdown;charset=utf-8')
    expect(await blobs[0].text()).toBe(shown)
    expect(exportStatus().textContent).toBe('Download do DESIGN.md iniciado.')
  })

  it('o arquivo baixado reflete a última edição', async () => {
    const { user } = setup()
    const name = screen.getByLabelText('Nome do design system')
    await user.clear(name)
    await user.type(name, 'Marca Nova')
    await waitFor(() => expect(designMdOutput().textContent).toContain('name: Marca Nova'))

    await user.click(downloadButton())

    expect(await blobs[0].text()).toBe(designMdOutput().textContent)
    expect(await blobs[0].text()).toContain('# Marca Nova')
  })

  it('copia exatamente o conteúdo mostrado e avisa', async () => {
    const { user } = setup()

    await user.click(copyButton())

    await waitFor(() => expect(exportStatus().textContent).toBe('DESIGN.md copiado para a área de transferência.'))
    expect(await navigator.clipboard.readText()).toBe(designMdOutput().textContent)
  })

  it('usa o método antigo de cópia quando a API assíncrona falha', async () => {
    const { user } = setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('negado'))
    const execCommand = vi.fn(() => true)
    document.execCommand = execCommand

    await user.click(copyButton())

    await waitFor(() => expect(exportStatus().textContent).toBe('DESIGN.md copiado para a área de transferência.'))
    expect(execCommand).toHaveBeenCalledWith('copy')
  })

  it('informa quando não é possível copiar', async () => {
    const { user } = setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('negado'))
    document.execCommand = vi.fn(() => false)

    await user.click(copyButton())

    await waitFor(() => expect(exportStatus().textContent).toMatch(/^Não foi possível copiar automaticamente/))
  })

  it('com erros, bloqueia copiar e baixar, explica e leva aos problemas', async () => {
    const { user } = setup()
    const name = screen.getByLabelText('Nome do design system')
    await user.clear(name)

    await waitFor(() => expect(downloadButton().getAttribute('aria-disabled')).toBe('true'))
    expect(copyButton().getAttribute('aria-disabled')).toBe('true')
    const reason = document.getElementById(downloadButton().getAttribute('aria-describedby') ?? '')
    expect(reason?.textContent).toContain('Corrija 1 erro para exportar o DESIGN.md.')

    await user.click(downloadButton())
    await user.click(copyButton())
    expect(downloads).toEqual([])
    expect(exportStatus().textContent).toBe('Cópia bloqueada. Corrija 1 erro para exportar o DESIGN.md.')

    await user.click(screen.getByRole('button', { name: 'Ver problemas' }))
    expect(screen.getByRole('tab', { name: /Problemas/ }).getAttribute('aria-selected')).toBe('true')

    await user.type(name, 'ACME')
    await waitFor(() => expect(downloadButton().getAttribute('aria-disabled')).toBeNull())
    await user.click(downloadButton())
    expect(downloads).toHaveLength(1)
  })
})
