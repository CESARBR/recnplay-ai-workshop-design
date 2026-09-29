// Linha do rascunho: de onde o editor começou e a ação de restaurar o exemplo (RF-12).
import { useState } from 'react'
import { Info, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { ConfirmDialog } from './confirm-dialog'

export type DraftNotice = 'loaded' | 'discarded' | 'empty' | 'restored'

const NOTICE_TEXT: Record<DraftNotice, string> = {
  loaded: 'Continuando o rascunho salvo neste navegador.',
  discarded: 'Não foi possível ler o rascunho salvo neste navegador; começamos pelo exemplo da ACME.',
  empty: 'Começando pelo exemplo da ACME. Suas alterações ficam salvas neste navegador.',
  restored: 'Exemplo da ACME restaurado. O rascunho anterior foi apagado deste navegador.',
}

type DraftBarProps = { notice: DraftNotice; onRestore: () => void }

export function DraftBar({ notice, onRestore }: DraftBarProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex flex-wrap items-center justify-between gap-sm">
      {/* Anuncia quando o aviso muda (ex.: depois de restaurar). */}
      <p role="status" aria-label="Situação do rascunho" className="flex items-start gap-sm text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        {NOTICE_TEXT[notice]}
      </p>
      <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(true)}>
        <RotateCcw aria-hidden /> Restaurar exemplo
      </Button>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Restaurar o exemplo da ACME?"
        description={
          <>
            <span>
              Todas as alterações serão descartadas: identidade, cores, tipografia, escalas, componentes e
              orientações voltam ao exemplo inicial.
            </span>
            <span>O rascunho salvo neste navegador também será apagado. Não é possível desfazer.</span>
          </>
        }
        confirmLabel="Restaurar exemplo"
        onConfirm={onRestore}
      />
    </div>
  )
}
