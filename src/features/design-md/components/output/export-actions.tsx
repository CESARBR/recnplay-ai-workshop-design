// Copiar e baixar o DESIGN.md. Com erros, as ações ficam bloqueadas (mas alcançáveis pelo
// teclado, com `aria-disabled`), explicando o motivo e levando aos problemas.
import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, Copy, Download } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { copyText } from '../../export/clipboard'
import { DESIGN_MD_FILENAME, downloadText } from '../../export/download'
import type { DesignMdBuild } from '../../pipeline'

type Status = { kind: 'success' | 'error'; text: string }

const STATUS_DURATION_MS = 5000
const BLOCKED_MESSAGE_ID = 'design-md-export-blocked'

type ExportActionsProps = { build: DesignMdBuild; onShowProblems: () => void }

export function ExportActions({ build, onShowProblems }: ExportActionsProps) {
  const [status, setStatus] = useState<Status>()
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const blocked = !build.canExport
  const errors = build.errorCount

  useEffect(() => () => clearTimeout(timer.current), [])

  const announce = (next: Status) => {
    clearTimeout(timer.current)
    setStatus(next)
    timer.current = setTimeout(() => setStatus(undefined), STATUS_DURATION_MS)
  }

  const blockedText = `Corrija ${errors} ${errors === 1 ? 'erro' : 'erros'} para exportar o DESIGN.md.`

  const onDownload = () => {
    if (blocked) return announce({ kind: 'error', text: `Download bloqueado. ${blockedText}` })
    downloadText(build.content)
    announce({ kind: 'success', text: `Download do ${DESIGN_MD_FILENAME} iniciado.` })
  }

  const onCopy = async () => {
    if (blocked) return announce({ kind: 'error', text: `Cópia bloqueada. ${blockedText}` })
    const copied = await copyText(build.content)
    announce(
      copied
        ? { kind: 'success', text: 'DESIGN.md copiado para a área de transferência.' }
        : {
            kind: 'error',
            text: 'Não foi possível copiar automaticamente. Abra a aba DESIGN.md, selecione o texto e copie.',
          },
    )
  }

  const blockedProps = blocked ? { 'aria-disabled': true, 'aria-describedby': BLOCKED_MESSAGE_ID } : {}

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex flex-wrap gap-sm">
        {/* Única ação principal (tertiary) da tela, conforme o DESIGN.md. */}
        <Button type="button" onClick={onDownload} {...blockedProps}>
          <Download aria-hidden /> Baixar {DESIGN_MD_FILENAME}
        </Button>
        <Button type="button" variant="outline" onClick={onCopy} {...blockedProps}>
          <Copy aria-hidden /> Copiar
        </Button>
      </div>

      {blocked && (
        <p id={BLOCKED_MESSAGE_ID} className="flex flex-wrap items-center gap-x-sm gap-y-1 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          {blockedText}
          <Button type="button" variant="link" size="sm" className="h-auto px-0 py-0" onClick={onShowProblems}>
            Ver problemas
          </Button>
        </p>
      )}

      <p
        role="status"
        aria-label="Resultado da exportação"
        aria-live="polite"
        // Vazio, fica só para leitores de tela (sem ocupar espaço); a região precisa existir antes
        // da mensagem para o anúncio funcionar, por isso não é removida do DOM.
        className={cn(
          status ? 'flex items-center gap-1.5 text-sm' : 'sr-only',
          status?.kind === 'error' ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {status?.kind === 'success' && <Check className="size-4 shrink-0" aria-hidden />}
        {status?.text}
      </p>
    </div>
  )
}
