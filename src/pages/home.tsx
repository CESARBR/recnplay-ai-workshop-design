import { ArrowRight, FileDown, MapPin, Palette } from 'lucide-react'
import { Link } from 'react-router'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { facilitatorPhotoUrl, facilitators } from '@/data/facilitators'

export function HomePage() {
  return (
    <div className="flex flex-col gap-lg">
      <title>Do Prompt ao Protótipo · REC’n’Play Capítulo IA · CESAR</title>
      <PageHeader
        eyebrow="REC’n’Play Capítulo IA"
        eyebrowNormalCase
        title="Do Prompt ao Protótipo: Criando Interfaces com IA"
        meta={
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4 text-tertiary" aria-hidden />
            Laboratório de Inovação
          </span>
        }
        description={
          <>
            Nesta oficina, especialistas do CESAR conduzem uma experiência prática para quem quer
            sair do “ouvir sobre IA” para “usar IA”. A partir de um briefing simples e usando
            ferramentas de geração de interface por prompt, cada participante chega a um protótipo
            navegável — sem escrever código e sem experiência prévia em design.
          </>
        }
      />

      <p className="max-w-3xl text-muted-foreground">
        O foco não é dominar uma ferramenta específica, e sim o método: como traduzir uma
        necessidade em prompt, como iterar sobre o resultado gerado e como avaliar rapidamente se
        aquela tela atende ao problema.
      </p>

      <div className="grid gap-md md:grid-cols-2">
        <Card>
          <CardHeader>
            <FileDown className="size-6 text-tertiary" aria-hidden />
            <CardTitle asChild>
              <h2>AGENTS.md</h2>
            </CardTitle>
            <CardDescription>
              Baixe os arquivos de instruções que vamos usar com as ferramentas de IA durante a
              oficina.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/agentsmd">
                Ver arquivos <ArrowRight />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <Palette className="size-6 text-tertiary" aria-hidden />
            <CardTitle asChild>
              <h2>DESIGN.md</h2>
            </CardTitle>
            <CardDescription>
              Gere o DESIGN.md com a identidade visual do seu protótipo para orientar a IA.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/designmd">
                Abrir gerador <ArrowRight />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <section aria-labelledby="facilitadores" className="flex flex-col gap-md">
        <h2 id="facilitadores" className="label-caps text-brand-secondary">
          Facilitadores
        </h2>
        <ul className="flex flex-wrap gap-x-lg gap-y-md">
          {facilitators.map((person) => (
            <li key={person.name} className="flex items-center gap-3">
              <img
                src={facilitatorPhotoUrl(person.photo)}
                alt=""
                width={48}
                height={48}
                loading="lazy"
                className="size-12 shrink-0 rounded-full border object-cover"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold">{person.name}</span>
                <span lang={person.roleLang} className="text-sm text-muted-foreground">
                  {person.role}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
