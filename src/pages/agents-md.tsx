import { Download } from 'lucide-react'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { agentFileUrl, agents } from '@/data/agents'

export function AgentsMdPage() {
  return (
    <div className="flex flex-col gap-lg">
      <title>AGENTS.md · Do Prompt ao Protótipo · CESAR</title>
      <PageHeader
        eyebrow="Downloads"
        title="AGENTS.md"
        description="Escolha o app que você vai prototipar, baixe o AGENTS.md dele e coloque o arquivo na raiz do seu projeto. Ele explica para a IA o contexto do produto, as telas, os dados de exemplo e o desafio de design, como um CLAUDE.md."
      />

      <ol className="grid gap-md md:grid-cols-2">
        {agents.map((agent, index) => (
          <li key={agent.slug} className="flex">
            <Card className="w-full">
              <CardHeader>
                {/* A numeração já é anunciada pela lista ordenada. */}
                <span aria-hidden className="label-caps text-brand-secondary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <CardTitle asChild>
                  <h2>{agent.title}</h2>
                </CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <span className="label-caps text-brand-secondary">Desafio de design</span>
                <p className="text-sm font-semibold">{agent.challenge}</p>
              </CardContent>
              <CardFooter className="-ml-3">
                {/* Download de vários itens: usa button-secondary; o tertiary sólido fica reservado ao CTA principal. */}
                <Button asChild variant="secondary">
                  <a href={agentFileUrl(agent.slug)} download="AGENTS.md">
                    <Download /> Baixar AGENTS.md
                    <span className="sr-only"> do app {agent.title}</span>
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ol>
    </div>
  )
}
