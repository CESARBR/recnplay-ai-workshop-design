import { Download } from 'lucide-react'
import { Link } from 'react-router'

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
import { projectFileName, projectFileUrl, projects } from '@/data/projects'

export function ProjectsPage() {
  return (
    <div className="flex flex-col gap-lg">
      <title>Projetos · Do Prompt ao Protótipo · CESAR</title>
      <PageHeader
        eyebrow="Downloads"
        title="Projetos"
        description="Escolha o app que você vai prototipar e baixe o projeto dele. Cada ZIP é uma pasta pronta para abrir na ferramenta de IA."
      />

      <section aria-labelledby="como-usar" className="flex max-w-3xl flex-col gap-sm">
        <h2 id="como-usar" className="label-caps text-brand-secondary">
          Como usar
        </h2>
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-muted-foreground">
          <li>Baixe o ZIP do app escolhido e descompacte.</li>
          <li>
            Abra a pasta na ferramenta de IA. O <code>AGENTS.md</code> traz o briefing do app, e a pasta{' '}
            <code>.agents/skills</code> traz as skills para gerar os requisitos e os protótipos.
          </li>
          <li>
            Gere o seu <code>DESIGN.md</code> no{' '}
            {/* Sublinhado sempre visível: link no meio do texto não pode depender só da cor. */}
            <Link to="/designmd" className="font-semibold text-tertiary-text underline underline-offset-4">
              gerador de DESIGN.md
            </Link>{' '}
            e coloque o arquivo na raiz da pasta: os protótipos usam o tema definido nele.
          </li>
        </ol>
      </section>

      <ol className="grid gap-md md:grid-cols-2">
        {projects.map((project, index) => (
          <li key={project.slug} className="flex">
            <Card className="w-full">
              <CardHeader>
                {/* A numeração já é anunciada pela lista ordenada. */}
                <span aria-hidden className="label-caps text-brand-secondary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <CardTitle asChild>
                  <h2>{project.title}</h2>
                </CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <span className="label-caps text-brand-secondary">Desafio de design</span>
                <p className="text-sm font-semibold">{project.challenge}</p>
              </CardContent>
              <CardFooter className="-ml-3">
                {/* Download de vários itens: usa button-secondary; o tertiary sólido fica reservado ao CTA principal. */}
                <Button asChild variant="secondary">
                  <a
                    href={projectFileUrl(project.slug)}
                    download={projectFileName(project.slug)}
                    aria-label={`Baixar o projeto ${project.title} (ZIP)`}
                  >
                    <Download aria-hidden /> Baixar projeto (ZIP)
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
