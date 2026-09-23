import { PageHeader } from '@/components/layout/page-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// TODO: o gerador de DESIGN.md será definido em uma próxima etapa.
export function DesignMdPage() {
  return (
    <div className="flex flex-col gap-lg">
      <title>Gerador de DESIGN.md · Do Prompt ao Protótipo · CESAR</title>
      <PageHeader
        eyebrow="Ferramenta"
        title="Gerador de DESIGN.md"
        description="Crie o DESIGN.md com cores, tipografia e componentes do seu protótipo para que a ferramenta de IA gere telas consistentes com a sua identidade visual."
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <Badge>Em breve</Badge>
          <CardTitle asChild>
            <h2>Estamos preparando esta ferramenta</h2>
          </CardTitle>
          <CardDescription>
            O gerador estará disponível durante a oficina. Enquanto isso, você já pode baixar os
            arquivos AGENTS.md.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
