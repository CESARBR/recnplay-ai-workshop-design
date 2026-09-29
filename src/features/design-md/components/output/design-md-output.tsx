// Conteúdo do DESIGN.md gerado. Na etapa 8 ganha copiar e baixar.
import type { DesignMdBuild } from '../../pipeline'

export function DesignMdOutput({ build, isUpdating }: { build: DesignMdBuild; isUpdating: boolean }) {
  return (
    <pre
      tabIndex={0}
      aria-label="Conteúdo do DESIGN.md"
      aria-busy={isUpdating}
      className="max-h-[70vh] overflow-auto rounded-sm border bg-neutral p-4 font-mono text-xs leading-5 whitespace-pre-wrap"
    >
      {build.content}
    </pre>
  )
}
